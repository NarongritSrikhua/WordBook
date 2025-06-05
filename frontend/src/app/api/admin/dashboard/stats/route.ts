import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Fetching admin dashboard stats...');
    
    const token = await getTokenFromRequest(request);
    if (!token) {
      console.log('[API] No token found, returning 401');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log(`[API] Forwarding request to ${backendUrl}/admin/dashboard/stats`);
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[API] Backend error: ${response.status} ${response.statusText}`, errorData);
      return NextResponse.json(
        { message: errorData.message || `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API] Successfully fetched admin dashboard stats');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch admin dashboard stats' },
      { status: 500 }
    );
  }
} 