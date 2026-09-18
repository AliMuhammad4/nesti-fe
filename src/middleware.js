import { NextResponse } from 'next/server';

function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Best-effort route protection. API remains the source of truth for authz.
 * When an auth-token cookie is present, block non-admins from /admin.
 */
export function middleware(request) {
  const authCookie = request.cookies.get('auth-token') || request.cookies.get('token');
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  if (isAdminRoute && authCookie?.value) {
    const payload = decodeJwtPayload(authCookie.value);
    const role = payload?.role || payload?.user?.role;
    if (role && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/client-dashboard/:path*',
    '/settings/:path*',
    '/leads/:path*',
    '/analytics/:path*',
  ],
};
