import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, getTokenFromRequest } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  // Check authentication
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Only admins can access this endpoint
  if (session.role !== 'admin') {
    return NextResponse.json(
      { message: 'Forbidden: Only admins can access this endpoint' },
      { status: 403 }
    );
  }
  
  try {
    // Forward the request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Get token from the request
    const token = getTokenFromRequest(request);
    
    const response = await fetch(`${backendUrl}/users`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch users' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}