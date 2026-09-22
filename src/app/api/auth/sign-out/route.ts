import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  await clearAuthCookies();

  const acceptsHtml = request.headers.get('accept')?.includes('text/html');
  if (acceptsHtml) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.json({ success: true, redirectUrl: '/sign-in' });
}

export async function GET(request: NextRequest) {
  await clearAuthCookies();
  return NextResponse.redirect(new URL('/sign-in', request.url));
}
