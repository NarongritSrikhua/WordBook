import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role
      }
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}



