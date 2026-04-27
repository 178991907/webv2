import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const sessionCookieName = "erin-nav-session";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(sessionCookieName);
  const { pathname } = request.nextUrl;

  // If user is trying to access admin pages without being logged in, redirect to login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If user is logged in and tries to access login page, redirect to admin dashboard
  if (pathname.startsWith('/admin/login')) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}
