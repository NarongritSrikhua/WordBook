import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../lib/users';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json();
    
    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    console.log('Login attempt for:', email);
    console.log('Available users:', users);
    
    // Find user by email and check password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Set a simple session cookie
      const response = NextResponse.json(
        { 
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        },
        { status: 200 }
      );
      
      // Set a secure HTTP-only cookie
      response.cookies.set({
        name: 'auth_session',
        value: `user_${user.id}_session`,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      return response;
    }
    
    // Invalid credentials
    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}


