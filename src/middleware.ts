import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

export async function middleware(request: NextRequest) {
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

  // Check if user is authenticated using NextAuth v5
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'default-dev-secret-change-in-production',
    cookieName: process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  });

  // If authenticated, let them through
  if (token) {
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
