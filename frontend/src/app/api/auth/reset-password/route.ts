import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    console.log('Reset password request received:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      hasNewPassword: !!newPassword 
    });

    if (!token || !newPassword) {
      console.log('Missing required fields:', { token: !!token, newPassword: !!newPassword });
      return NextResponse.json(
        { message: 'Token and new password are required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log(`Sending reset password request to backend: ${backendUrl}/auth/reset-password`);

    const response = await fetch(`${backendUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    console.log('Backend response:', { 
      status: response.status, 
      ok: response.ok,
      message: data.message 
    });

    if (!response.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { message: data.message || 'Something went wrong' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 