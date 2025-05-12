import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../../lib/users';

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
    
    console.log('Admin login attempt for:', email);
    
    // Find user by email and check password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user && user.role === 'admin') {
      // Set a simple session cookie
      const response = NextResponse.json(
        { 
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
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
    
    // If user not found or not admin
    return NextResponse.json(
      { message: 'Invalid credentials or insufficient permissions' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}