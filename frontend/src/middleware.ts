import { NextResponse, NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/', '/login', '/register', '/unauthorized', '/forbidden'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for public routes, API routes, and static assets
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api') || 
    publicRoutes.includes(path) ||
    path.includes('.') // Skip files with extensions (like favicon.ico)
  ) {
    return NextResponse.next();
  }
  
  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route));
  
  // If not a protected route, proceed
  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next();
  }
  
  // Get token from cookies
  const token = request.cookies.get('auth_session')?.value || 
                request.cookies.get('token')?.value;
  
  // If the route is protected and there's no token, redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }
  
  // For protected routes, just check if token exists
  // The actual role verification will happen in the layout components
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
