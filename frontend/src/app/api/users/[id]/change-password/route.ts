import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    const userId = params.id;

    console.log('Change password request received:', { 
      userId,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword
    });

    if (!currentPassword || !newPassword) {
      console.log('Missing required fields:', { 
        currentPassword: !!currentPassword, 
        newPassword: !!newPassword 
      });
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.error('No authorization header found');
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`Sending change password request to backend: ${backendUrl}/users/${userId}/change-password`);

    const response = await fetch(`${backendUrl}/users/${userId}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
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
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 