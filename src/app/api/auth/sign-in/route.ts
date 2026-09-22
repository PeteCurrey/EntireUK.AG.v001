import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithPassword, setAuthCookies } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, redirect } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const result = await authenticateWithPassword(email, password);

    if (result.error || !result.session) {
      return NextResponse.json(
        { error: result.error || 'Authentication failed.' },
        { status: 401 }
      );
    }

    await setAuthCookies(result.session);

    // Validate redirect path to prevent open redirect vulnerabilities
    let safeRedirect = '/dashboard';
    if (redirect && typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
      safeRedirect = redirect;
    }

    return NextResponse.json({
      success: true,
      redirectUrl: safeRedirect,
      user: result.session.user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
