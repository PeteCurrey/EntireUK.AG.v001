import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'sb-access-token';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/land-radar',
  '/review',
  '/validation',
  '/data-health',
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
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/land-radar/:path*',
    '/review/:path*',
    '/validation/:path*',
    '/data-health/:path*',
    '/sign-in',
  ],
};
