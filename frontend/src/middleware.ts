import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from './app/lib/auth';

// Define which paths require authentication
const protectedPaths = ['/dashboard', '/profile', '/settings'];
const adminPaths = ['/admin', '/admin/dashboard', '/admin/users', '/admin/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for admin login paths
  if (pathname === '/admin/login' || pathname === '/admin-login') {
    return NextResponse.next();
  }
  
  // Check if the path is admin-only
  const isAdminPath = adminPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (isAdminPath) {
    const session = getSessionFromRequest(request);
    
    // If no session exists or user is not admin, redirect to admin login
    if (!session || session.role !== 'admin') {
      // Use the new admin-login path that bypasses middleware
      const url = new URL('/admin-login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
    
    // For admin paths, we'll handle the layout in the admin layout component
    return NextResponse.next();
  }
  
  // Check if the path is protected (regular user)
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (isProtectedPath) {
    const session = getSessionFromRequest(request);
    
    // If no session exists, redirect to login
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};




