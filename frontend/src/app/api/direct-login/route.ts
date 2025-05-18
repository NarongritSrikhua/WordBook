import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const url = `${backendUrl}/auth/login`;
  
  console.log(`Directly proxying login request to: ${url}`);
  
  try {
    const body = await request.text();
    console.log('Login request body:', body);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });
    
    console.log('Backend login response status:', response.status);
    const data = await response.json().catch(() => ({}));
    console.log('Backend login response data:', data);
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Direct login proxy error:', error);
    return NextResponse.json(
      { message: 'Failed to connect to backend server', error: String(error) },
      { status: 500 }
    );
  }
}

