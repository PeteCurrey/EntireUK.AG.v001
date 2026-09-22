import { NextRequest, NextResponse } from 'next/server';
import { proxyVectorTileRequest, isOsConfigured } from '@/lib/land-radar/clients/osClient';
import { getCurrentUser, AUTH_COOKIE_NAME } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/map/os-tiles/[...tilePath]
 *
 * Secure server-side proxy for OS Vector Tile API.
 * Injects `OS_API_KEY` server-side so client browsers and network inspectors never observe credentials.
 * Restricts access to authenticated analysts or internal application sessions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tilePath: string[] }> }
) {
  // 1. Check analyst authentication
  const hasAuthCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const currentUser = await getCurrentUser();
  const isAuthorized = hasAuthCookie || Boolean(currentUser);

  if (!isAuthorized) {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Active analyst session required to load vector tiles.' },
        { status: 401 }
      );
    }
  }

  // 2. Verify OS credentials configured
  if (!isOsConfigured()) {
    return NextResponse.json(
      { error: 'OS_API_KEY_NOT_CONFIGURED', message: 'Ordnance Survey API credentials are not set on this server.' },
      { status: 503 }
    );
  }

  const { tilePath } = await params;
  if (!tilePath || tilePath.length === 0) {
    return NextResponse.json({ error: 'INVALID_PATH', message: 'Tile path is required.' }, { status: 400 });
  }

  // Construct sub-path preserving query parameters (e.g. srs)
  const searchParams = request.nextUrl.searchParams;
  // Clean any attempts to pass an external key parameter
  searchParams.delete('key');
  searchParams.delete('api_key');

  const queryString = searchParams.toString();
  const subPath = tilePath.join('/') + (queryString ? `?${queryString}` : '');

  const result = await proxyVectorTileRequest(subPath);

  if (!result.body) {
    return NextResponse.json(
      { error: 'TILE_FETCH_FAILED', message: result.error || 'Failed to fetch tile from OS upstream.' },
      { status: result.status || 502 }
    );
  }

  const headers = new Headers();
  headers.set('Content-Type', result.contentType);

  // Set appropriate cache headers for vector tiles and styles
  if (subPath.endsWith('.pbf') || subPath.includes('/tile/')) {
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
  } else {
    headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  }

  return new Response(result.body as any, {
    status: result.status,
    headers,
  });
}
