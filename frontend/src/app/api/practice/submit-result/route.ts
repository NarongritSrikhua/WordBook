import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromCookie } from '@/app/lib/auth/cookies';
import { getSessionFromRequest } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    console.log('[API] Submitting practice result to backend');
    
    // Get the request body
    const body = await request.json();
    console.log('[API] Practice result data:', body);
    
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    console.log('[API] Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('[API] Token from cookie:', token ? 'Present' : 'Missing');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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
    
    // Make sure the userId from the request body is preserved
    console.log('[API] Original request body userId:', body.userId);

    // If userId is not provided in the body, try to get it from the session
    if (!body.userId) {
      console.log('[API] No userId in request body, attempting to get from session');
      try {
        const session = getSessionFromRequest(request);
        if (session?.id) {
          body.userId = session.id;
          console.log('[API] Added userId from session:', body.userId);
        }
      } catch (error) {
        console.error('[API] Error getting session:', error);
      }
    }

    // If we still don't have a userId, use a hardcoded one for testing
    if (!body.userId && process.env.NODE_ENV !== 'production') {
      body.userId = 'test-user-id';
      console.log('[API] Using test user ID for development');
    }

    console.log('[API] Final request body with userId:', body.userId);
    console.log('[API] Calling backend endpoint: /practice/submit-result');
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/practice/submit-result`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include', // Include cookies in the request
    });
    
    if (!response.ok) {
      console.error(`[API] Backend error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('[API] Practice result submitted successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error submitting practice result:', error);
    return NextResponse.json(
      { message: 'Failed to submit practice result' },
      { status: 500 }
    );
  }
}





