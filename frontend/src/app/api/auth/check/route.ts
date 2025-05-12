import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  
  if (session) {
    // Return user info without sensitive data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email
      }
    });
  }
  
  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}


