import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { middleware } from '../../../middleware';
import { AUTH_COOKIE_NAME } from '../../auth/session';

describe('SEC-013-01: Defence-in-Depth Internal Route Protection', () => {
  const protectedRoutes = [
    '/acquisitions',
    '/acquisitions/site-warwick-001',
    '/dashboard',
    '/land-radar',
    '/review',
    '/review/site-warwick-001',
    '/validation',
    '/data-health',
  ];

  for (const path of protectedRoutes) {
    it(`redirects unauthenticated request to ${path} to /sign-in`, () => {
      const request = new NextRequest(`https://entire-uk.com${path}`);
      const response = middleware(request);

      assert.strictEqual(response.status, 307, `Expected redirect status for ${path}`);
      const location = response.headers.get('location');
      assert.ok(location, `Expected location header for ${path}`);
      const redirectUrl = new URL(location);
      assert.strictEqual(redirectUrl.pathname, '/sign-in');
      assert.strictEqual(redirectUrl.searchParams.get('redirect'), path);
    });
  }

  it('blocks unauthenticated direct access to internal API routes with HTTP 401', () => {
    const request = new NextRequest('https://entire-uk.com/api/map/os-tiles/12/2048/1360.pbf');
    const response = middleware(request);

    assert.strictEqual(response.status, 401);
  });

  it('allows authenticated analyst through to protected internal routes', () => {
    const request = new NextRequest('https://entire-uk.com/acquisitions/site-warwick-001');
    request.cookies.set(AUTH_COOKIE_NAME, 'valid-analyst-session-token');

    const response = middleware(request);
    // In Next.js middleware, passing through returns 200 / NextResponse.next()
    assert.strictEqual(response.status, 200);
  });

  it('redirects authenticated user visiting /sign-in directly to /dashboard', () => {
    const request = new NextRequest('https://entire-uk.com/sign-in');
    request.cookies.set(AUTH_COOKIE_NAME, 'valid-analyst-session-token');

    const response = middleware(request);
    assert.strictEqual(response.status, 307);
    const location = response.headers.get('location');
    assert.ok(location);
    assert.strictEqual(new URL(location).pathname, '/dashboard');
  });

  it('allows unauthenticated visitors to view public marketing and submission pages', () => {
    const publicPaths = [
      '/',
      '/about',
      '/approach',
      '/contact',
      '/opportunities',
      '/technology',
      '/submit',
      '/submit/land',
      '/submit/property',
      '/submit/success',
      '/privacy',
      '/terms',
      '/sign-in',
    ];

    for (const path of publicPaths) {
      const request = new NextRequest(`https://entire-uk.com${path}`);
      const response = middleware(request);
      assert.strictEqual(response.status, 200, `Expected public path ${path} to be accessible`);
    }
  });
});
