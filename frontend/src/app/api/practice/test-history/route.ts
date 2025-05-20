import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    console.log('[API] Testing practice history from backend');
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/practice/history`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error(`[API] Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('[API] Practice history test successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error testing practice history:', error);
    return NextResponse.json(
      { message: 'Failed to test practice history' },
      { status: 500 }
    );
  }
}