import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth check for login page and API routes
  const isLoginPage = pathname === '/login';
  const isAuthApi = pathname.startsWith('/api/auth');

  if (isLoginPage || isAuthApi) {
    return NextResponse.next();
  }

  // For all other /admin routes, check authentication
  if (pathname.startsWith('/admin')) {
    // We can't use async auth() in middleware without exporting auth()
    // So we'll let the layout handle auth, but add a header for optimization
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    requestHeaders.set('x-needs-auth', 'true');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
