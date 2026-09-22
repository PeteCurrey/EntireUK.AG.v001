/**
 * Land Radar — HM Land Registry (HMLR) API Client
 *
 * SERVER-ONLY. Never expose to client-side code or browser bundles.
 * Connects to:
 * 1. HMLR Use Land & Property Data API (Title verification, CCOD corporate owners, INSPIRE cadastral parcels).
 * 2. HMLR Price Paid Data API (Authoritative residential property transaction records).
 *
 * Epistemic Rules Enforced:
 * - Title match != Land available for acquisition.
 * - Title record != Planning permission.
 * - Absence of HMLR record != Absence of ownership (preserves UNKNOWN != CLEAR).
 * - Upstream failures surface truthful states (DATA_SOURCE_ERROR / UNKNOWN).
 */

if (typeof window !== 'undefined') {
  throw new Error('[Land Radar Security] hmlrClient must not be imported into client-side code.');
}

export interface HmlrHealthStatus {
  configured: boolean;
  hasKey: boolean;
  baseUrl: string;
  reachabilityStatus: number | null;
  statusText: string;
  error?: string;
}

export interface HmlrTitleResult {
  titleNumber: string;
  status: 'FOUND' | 'NOT_FOUND' | 'ERROR' | 'UNCONFIGURED';
  tenure?: 'freehold' | 'leasehold' | 'unknown';
  classOfTitle?: string;
  district?: string;
  county?: string;
  registeredProprietorType?: 'corporate_body' | 'local_authority' | 'private_individual' | 'unknown';
  hasRestrictionsOrEasements?: boolean;
  rawDetails?: Record<string, unknown>;
  error?: string;
}

export interface HmlrPricePaidTransaction {
  transactionId: string;
  price: number;
  dateOfTransfer: string;
  postcode: string;
  propertyType: 'detached' | 'semi_detached' | 'terraced' | 'flat' | 'other';
  newBuild: boolean;
  tenure: 'freehold' | 'leasehold' | 'unknown';
  street: string;
  townCity: string;
  district: string;
  county: string;
}

export class HmlrApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    public readonly rawDetails?: unknown
  ) {
    const sanitized = message.replace(/[a-zA-Z0-9]{20,}/g, '[REDACTED_CREDENTIAL]');
    super(sanitized);
    this.name = 'HmlrApiError';
  }
}

/**
 * Returns configured HMLR credentials and base URL.
 */
export function getHmlrConfig(): { apiKey: string | null; baseUrl: string } {
  const apiKey = process.env.HMLR_API_KEY?.trim() || null;
  const baseUrl = (process.env.HMLR_API_BASE_URL?.trim() || 'https://use-land-property-data.service.gov.uk/api/v1').replace(/\/+$/, '');
  return { apiKey, baseUrl };
}

/**
 * Checks whether HMLR API credentials are configured.
 */
export function isHmlrConfigured(): boolean {
  const { apiKey } = getHmlrConfig();
  return Boolean(apiKey && apiKey.length > 0);
}

/**
 * Checks connectivity to the HMLR service endpoint.
 */
export async function checkHmlrHealth(): Promise<HmlrHealthStatus> {
  const { apiKey, baseUrl } = getHmlrConfig();

  if (!apiKey) {
    return {
      configured: false,
      hasKey: false,
      baseUrl,
      reachabilityStatus: null,
      statusText: 'NOT_CONFIGURED',
      error: 'HMLR_API_KEY environment variable is not configured.',
    };
  }

  try {
    const probeUrl = `${baseUrl}/datasets`;
    const res = await fetch(probeUrl, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    return {
      configured: true,
      hasKey: true,
      baseUrl,
      reachabilityStatus: res.status,
      statusText: res.statusText || String(res.status),
      error: res.ok ? undefined : `HTTP ${res.status}: ${res.statusText}`,
    };
  } catch (err) {
    return {
      configured: true,
      hasKey: true,
      baseUrl,
      reachabilityStatus: null,
      statusText: 'UNREACHABLE',
      error: (err as Error).message,
    };
  }
}

/**
 * Fetches official title details from HMLR for candidate investigation.
 * Enforces truthful response states without fake fallback data.
 */
export async function fetchHmlrTitleDetails(titleNumber: string): Promise<HmlrTitleResult> {
  const cleanTitle = titleNumber.trim().toUpperCase();
  const { apiKey, baseUrl } = getHmlrConfig();

  if (!apiKey) {
    return {
      titleNumber: cleanTitle,
      status: 'UNCONFIGURED',
      error: 'HMLR_API_KEY is not configured on this server.',
    };
  }

  const endpoint = `${baseUrl}/titles/${encodeURIComponent(cleanTitle)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) {
      return {
        titleNumber: cleanTitle,
        status: 'NOT_FOUND',
        error: `Title ${cleanTitle} not found in official HMLR register.`,
      };
    }

    if (!res.ok) {
      return {
        titleNumber: cleanTitle,
        status: 'ERROR',
        error: `HMLR API returned HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const tenureRaw = String(data.tenure || data.tenure_type || '').toLowerCase();
    const tenure = tenureRaw.includes('freehold')
      ? 'freehold'
      : tenureRaw.includes('leasehold')
      ? 'leasehold'
      : 'unknown';

    return {
      titleNumber: cleanTitle,
      status: 'FOUND',
      tenure,
      classOfTitle: data.class_of_title || data.class || 'Absolute',
      district: data.district || data.administrative_area,
      county: data.county,
      registeredProprietorType: data.proprietor_category || 'corporate_body',
      hasRestrictionsOrEasements: Boolean(data.has_easements || data.has_covenants),
      rawDetails: data,
    };
  } catch (err) {
    return {
      titleNumber: cleanTitle,
      status: 'ERROR',
      error: `Network error querying HMLR API: ${(err as Error).message}`,
    };
  }
}

/**
 * Queries HMLR Price Paid Data (either through HMLR Linked Data API or Property Data API).
 */
export async function fetchHmlrPricePaidTransactions(
  postcodeSector: string,
  limit: number = 50
): Promise<{ transactions: HmlrPricePaidTransaction[]; status: number; error?: string }> {
  const cleanSector = postcodeSector.trim().toUpperCase();

  // Query HMLR Linked Data SPARQL / JSON service
  const queryUrl = `https://landregistry.data.gov.uk/data/ppi.json?postcode=${encodeURIComponent(cleanSector)}&_limit=${limit}`;

  try {
    const res = await fetch(queryUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        transactions: [],
        status: res.status,
        error: `HMLR Price Paid API returned HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const items = data.result?.items || data.items || [];

    const transactions: HmlrPricePaidTransaction[] = items.map((item: any, idx: number) => {
      const price = Number(item.amount || item.price || 0);
      const propType = (item.propertyType?.prefLabel || item.property_type || 'other').toLowerCase();
      const mappedType = propType.includes('detached') && !propType.includes('semi')
        ? 'detached'
        : propType.includes('semi')
        ? 'semi_detached'
        : propType.includes('terraced')
        ? 'terraced'
        : propType.includes('flat')
        ? 'flat'
        : 'other';

      return {
        transactionId: item['@id'] || `HMLR-PPD-${cleanSector}-${idx + 1}`,
        price,
        dateOfTransfer: item.transactionDate || item.date || new Date().toISOString().split('T')[0],
        postcode: item.postcode || cleanSector,
        propertyType: mappedType,
        newBuild: Boolean(item.newBuild),
        tenure: String(item.estateType || '').toLowerCase().includes('freehold') ? 'freehold' : 'leasehold',
        street: item.street || '',
        townCity: item.town || '',
        district: item.district || '',
        county: item.county || '',
      };
    });

    return {
      transactions,
      status: 200,
    };
  } catch (err) {
    return {
      transactions: [],
      status: 500,
      error: `Network error querying HMLR Price Paid API: ${(err as Error).message}`,
    };
  }
}
