import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromCookie } from '@/app/lib/auth/cookies';

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    console.log('[API] Fetching practice history from backend');
    
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
    
    console.log('[API] Calling backend endpoint: /practice/history');
    
    const response = await fetch(`${backendUrl}/practice/history`, {
      headers,
    });
    
    if (!response.ok) {
      console.error(`[API] Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`[API] Successfully fetched ${data.length} practice history entries`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error fetching practice history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch practice history' },
      { status: 500 }
    );
  }
}

