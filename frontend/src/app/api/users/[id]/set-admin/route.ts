import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/app/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const token = getTokenFromRequest(request);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log(`[PATCH Set Admin] Sending request to backend for user ${id}`);
    const response = await fetch(`${backendUrl}/users/${id}/set-admin`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[PATCH Set Admin] Backend responded with status ${response.status}`);
      return NextResponse.json(
        { message: 'Failed to set user as admin' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[PATCH Set Admin] Successfully set user as admin:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PATCH Set Admin] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 