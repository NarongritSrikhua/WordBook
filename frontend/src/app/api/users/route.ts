import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from the request
    const token = getTokenFromRequest(request);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log('[GET Users] Sending request to backend');
    const response = await fetch(`${backendUrl}/users`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[GET Users] Backend responded with status ${response.status}`);
      return NextResponse.json(
        { message: 'Failed to fetch users' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[GET Users] Successfully fetched ${data.length} users`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET Users] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 