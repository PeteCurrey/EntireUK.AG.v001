import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'sb-access-token';

const PROTECTED_PREFIXES = [
  '/acquisitions',
  '/dashboard',
  '/review',
  '/validation',
  '/data-health',
  '/api/map/os-tiles',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token && token.trim().length > 0);

  // 1. If user is authenticated and visits /sign-in, redirect to /dashboard
  if (pathname === '/sign-in' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Check if current path requires authentication
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuthenticated) {
    // If it's an internal API route, return 401 JSON instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required to access this resource.' },
        { status: 401 }
      );
    }

    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/acquisitions/:path*',
    '/dashboard/:path*',
    '/review/:path*',
    '/validation/:path*',
    '/data-health/:path*',
    '/api/map/os-tiles/:path*',
    '/sign-in',
  ],
};
