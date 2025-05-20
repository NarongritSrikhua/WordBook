import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromCookie } from '@/app/lib/auth/cookies';

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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have a token
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('[API] Calling backend endpoint: /practice/submit-result');
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/practice/submit-result`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error(`[API] Backend error: ${response.status} ${response.statusText}`);
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

