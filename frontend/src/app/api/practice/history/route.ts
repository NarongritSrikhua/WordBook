import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/app/lib/auth';

// Helper function to extract token from cookie
function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Get userId from query parameters
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');
    const forceRefresh = searchParams.get('force') === 'true';
    
    console.log(`[API] Initial userId from query: ${userId}`);
    
    // If no userId in query, try to get it from session
    if (!userId) {
      const session = getSessionFromRequest(request);
      if (session?.id) {
        userId = session.id;
        console.log(`[API] Using userId from session: ${userId}`);
      }
    }
    
    // If still no userId, check headers
    if (!userId) {
      const headerUserId = request.headers.get('X-User-ID');
      if (headerUserId) {
        userId = headerUserId;
        console.log(`[API] Using userId from header: ${userId}`);
      }
    }
    
    // If still no userId, return error
    if (!userId) {
      console.error('[API] No user ID available for fetching history');
      return NextResponse.json(
        { message: 'User ID is required to fetch practice history' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Fetching practice history for user: ${userId} (force=${forceRefresh})`);
    
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    console.log('[API] Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('[API] Token from cookie:', token ? 'Present' : 'Missing');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-User-ID': userId // Add user ID to headers
    };
    
    // Add Authorization header if we have a token
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('[API] Using Authorization header from request');
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] Using token from cookie');
    } else {
      console.log('[API] No authentication token available');
    }
    
    // Add force refresh header if needed
    if (forceRefresh) {
      headers['X-Force-Refresh'] = 'true';
    }
    
    // Add a cache-busting parameter to the URL
    const timestamp = new Date().getTime();
    const url = `${backendUrl}/practice/history?userId=${encodeURIComponent(userId)}&_=${timestamp}${forceRefresh ? '&force=true' : ''}`;
    console.log(`[API] Calling backend endpoint: ${url}`);
    
    // Forward the request to the backend
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      next: { revalidate: 0 } // Disable caching
    });
    
    if (!response.ok) {
      console.error(`[API] Backend error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`[API] Successfully fetched ${data.length} practice history entries for user ${userId}`);
    
    // Return the data with cache control headers
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('[API] Error fetching practice history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch practice history', error: error.toString() },
      { status: 500 }
    );
  }
}







