import { NextResponse } from 'next/server';

/**
 * Middleware to protect client-only and professional-only routes
 * This runs on every request before the page is rendered
 */
export function middleware(request) {
  // Get user info from cookies or headers (adjust based on your auth implementation)
  const authCookie = request.cookies.get('auth-token');
  
  if (!authCookie) {
    // Not authenticated, allow public routes
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const clientRoutes = ['/client-dashboard'];
  const professionalRoutes = ['/dashboard', '/settings', '/leads', '/analytics'];
  
  const isClientRoute = clientRoutes.some(route => pathname.startsWith(route));
  const isProfessionalRoute = professionalRoutes.some(route => pathname.startsWith(route));
  
  // For now, allow all routes (implement role checking when auth service is ready)
  // TODO: Decode JWT/session to get user role and enforce restrictions
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/client-dashboard/:path*',
    '/settings/:path*',
    '/leads/:path*',
    '/analytics/:path*',
  ],
};
