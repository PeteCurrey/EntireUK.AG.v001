/**
 * Land Radar — Ordnance Survey (OS) API Client
 *
 * SERVER-ONLY. Never expose to client-side code or browser bundles.
 * Connects to:
 * 1. OS Features API (WFS / OGC API): Ingests authoritative geographic features (e.g. Open Roads).
 * 2. OS Vector Tile API: Feeds server-proxied vector tiles and styles for geospatial workstation maps.
 *
 * Epistemic & Security Principles:
 * - Credentials (OS_API_KEY, OS_API_SECRET) remain strictly on the server.
 * - Errors are typed, observable, and stripped of credentials before logging or throwing.
 * - Upstream failures surface truthful error states (UNKNOWN / DATA_SOURCE_ERROR) without fake fallbacks.
 */

if (typeof window !== 'undefined') {
  throw new Error('[Land Radar Security] osClient must not be imported into client-side code.');
}

export interface OsHealthStatus {
  configured: boolean;
  hasKey: boolean;
  hasSecret: boolean;
  wfsStatus: number | null;
  wfsStatusText: string;
  vectorTilesStatus: number | null;
  vectorTilesStatusText: string;
  error?: string;
}

export interface OsRoadLinkFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: any;
  };
  properties: {
    ROAD_ID?: string;
    road_id?: string;
    ROAD_NAME?: string;
    CLASSIFICATION?: string;
    ADOPTED?: boolean;
    [key: string]: unknown;
  };
}

export class OsApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    public readonly rawDetails?: unknown
  ) {
    // Strip any inadvertent key/secret reflection in error message
    const sanitized = message.replace(/[a-zA-Z0-9]{20,}/g, '[REDACTED_CREDENTIAL]');
    super(sanitized);
    this.name = 'OsApiError';
  }
}

/**
 * Returns OS API credentials from the server environment.
 */
export function getOsCredentials(): { apiKey: string | null; apiSecret: string | null } {
  const apiKey = process.env.OS_API_KEY?.trim() || null;
  const apiSecret = process.env.OS_API_SECRET?.trim() || null;
  return { apiKey, apiSecret };
}

/**
 * Checks whether OS API credentials are configured.
 */
export function isOsConfigured(): boolean {
  const { apiKey } = getOsCredentials();
  return Boolean(apiKey && apiKey.length > 0);
}

/**
 * Verifies live endpoint reachability for OS Features and OS Vector Tile APIs.
 */
export async function checkOsHealth(): Promise<OsHealthStatus> {
  const { apiKey, apiSecret } = getOsCredentials();

  if (!apiKey) {
    return {
      configured: false,
      hasKey: false,
      hasSecret: Boolean(apiSecret),
      wfsStatus: null,
      wfsStatusText: 'NOT_CONFIGURED',
      vectorTilesStatus: null,
      vectorTilesStatusText: 'NOT_CONFIGURED',
      error: 'OS_API_KEY environment variable is not set.',
    };
  }

  let wfsStatus: number | null = null;
  let wfsStatusText = 'UNKNOWN';
  let vectorTilesStatus: number | null = null;
  let vectorTilesStatusText = 'UNKNOWN';
  let error: string | undefined;

  // 1. Probe OS Features API (WFS GetCapabilities)
  try {
    const wfsUrl = `https://api.os.uk/features/v1/wfs?service=WFS&version=2.0.0&request=GetCapabilities&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(wfsUrl, {
      method: 'GET',
      headers: { Accept: 'application/xml, text/xml' },
      signal: AbortSignal.timeout(6000),
    });
    wfsStatus = res.status;
    wfsStatusText = res.statusText || String(res.status);
  } catch (err) {
    wfsStatusText = 'UNREACHABLE';
    error = `WFS request failed: ${(err as Error).message}`;
  }

  // 2. Probe OS Vector Tile API (Style Sheet)
  try {
    const vtsUrl = `https://api.os.uk/maps/vector/v1/vts/resources/styles?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(vtsUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    vectorTilesStatus = res.status;
    vectorTilesStatusText = res.statusText || String(res.status);
  } catch (err) {
    vectorTilesStatusText = 'UNREACHABLE';
    error = error ? `${error} | VTS: ${(err as Error).message}` : `VTS: ${(err as Error).message}`;
  }

  return {
    configured: true,
    hasKey: true,
    hasSecret: Boolean(apiSecret),
    wfsStatus,
    wfsStatusText,
    vectorTilesStatus,
    vectorTilesStatusText,
    error,
  };
}

/**
 * Queries OS Features API for OpenRoads road links intersecting a given bounding box (EPSG:4326).
 */
export async function fetchOsRoadLinks(bbox: {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}): Promise<{ features: OsRoadLinkFeature[]; status: number; error?: string }> {
  const { apiKey } = getOsCredentials();
  if (!apiKey) {
    return {
      features: [],
      status: 401,
      error: 'OS_API_KEY is not configured on this server.',
    };
  }

  // Format bbox string for EPSG:4326 in WFS 2.0 (minLat, minLon, maxLat, maxLon or standard urn)
  const bboxStr = `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat},urn:ogc:def:crs:EPSG::4326`;
  const url = `https://api.os.uk/features/v1/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=OpenRoads_RoadLink&outputFormat=GEOJSON&srsName=urn:ogc:def:crs:EPSG::4326&bbox=${encodeURIComponent(bboxStr)}&key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 403) {
      // OS Data Hub key exists but the Open Roads layer is not enabled on this specific project
      return {
        features: [],
        status: 403,
        error: 'OS Features API returned 403 Forbidden: OpenRoads collection is not activated on this OS project key.',
      };
    }

    if (!res.ok) {
      return {
        features: [],
        status: res.status,
        error: `OS Features API returned HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const features: OsRoadLinkFeature[] = Array.isArray(data.features) ? data.features : [];
    return { features, status: 200 };
  } catch (err) {
    return {
      features: [],
      status: 500,
      error: `Network error connecting to OS Features API: ${(err as Error).message}`,
    };
  }
}

/**
 * Proxies a request to the OS Vector Tile API server-side, appending the API key.
 * Used exclusively by the `/api/map/os-tiles/[...tilePath]` route handler.
 */
export async function proxyVectorTileRequest(subPath: string): Promise<{
  status: number;
  contentType: string;
  body: ArrayBuffer | Uint8Array | null;
  error?: string;
}> {
  const { apiKey } = getOsCredentials();
  if (!apiKey) {
    return {
      status: 503,
      contentType: 'application/json',
      body: new Uint8Array(Buffer.from(JSON.stringify({ error: 'OS_API_KEY_NOT_CONFIGURED' }))),
      error: 'OS credentials not configured',
    };
  }

  // Base OS Vector Tile URL
  const separator = subPath.includes('?') ? '&' : '?';
  const targetUrl = `https://api.os.uk/maps/vector/v1/vts/${subPath}${separator}key=${encodeURIComponent(apiKey)}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
    const body = await upstreamRes.arrayBuffer();

    return {
      status: upstreamRes.status,
      contentType,
      body,
    };
  } catch (err) {
    return {
      status: 502,
      contentType: 'application/json',
      body: new Uint8Array(Buffer.from(JSON.stringify({ error: 'UPSTREAM_OS_UNAVAILABLE', message: (err as Error).message }))),
      error: (err as Error).message,
    };
  }
}
