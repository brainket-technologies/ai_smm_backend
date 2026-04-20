import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get('admin_token')?.value;

  // 1. Root /admin redirect
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 2. Protect Admin Dashboard Routes
  // Allow /admin/login to be accessible even if logged in (as per user possible preference)
  // But protect everything else under /admin
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
