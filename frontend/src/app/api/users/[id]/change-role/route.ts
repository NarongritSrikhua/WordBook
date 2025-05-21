import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, getTokenFromRequest } from '@/app/lib/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  
  // Check authentication
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Only admins can change user roles
  if (session.role !== 'admin') {
    return NextResponse.json(
      { message: 'Forbidden: Only admins can change user roles' },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    
    if (!body.role || !['user', 'admin'].includes(body.role)) {
      return NextResponse.json(
        { message: 'Invalid role provided' },
        { status: 400 }
      );
    }
    
    // Forward the request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Get token from the request
    const token = getTokenFromRequest(request);
    
    const response = await fetch(`${backendUrl}/users/${id}/change-role`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: body.role })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to update user role' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}