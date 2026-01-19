import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function checkSetupNeeded(origin: string): Promise<boolean> {
  try {
    const response = await fetch(`${origin}/api/setup`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json() as { needsSetup: boolean };
      return data.needsSetup;
    }
  } catch {
    // If check fails, assume setup is not needed
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth check for public pages and API routes
  const isPublicRoute = pathname === '/login' ||
                        pathname === '/setup' ||
                        pathname.startsWith('/api/auth') ||
                        pathname === '/api/setup' ||
                        pathname.startsWith('/_next') ||
                        pathname.startsWith('/static') ||
                        pathname.includes('favicon') ||
                        pathname.includes('.');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For Better Auth, we check for the session cookie
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;

  // If authenticated (has session cookie), let them through
  if (sessionToken) {
    return NextResponse.next();
  }

  // Not authenticated - check if setup is needed (no admin users exist)
  const needsSetup = await checkSetupNeeded(request.nextUrl.origin);
  if (needsSetup) {
    const url = request.nextUrl.clone();
    url.pathname = '/setup';
    return NextResponse.redirect(url);
  }

  // For protected admin routes, redirect to login
  if (pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
