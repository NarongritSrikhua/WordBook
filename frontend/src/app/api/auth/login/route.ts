import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Call backend API to authenticate
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log(`Attempting to authenticate with backend at ${backendUrl}/auth/login`);
    
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      console.error(`Backend authentication failed with status ${response.status}`);
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Authentication failed' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Backend authentication successful');
    
    // Create a JWT token with user info
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('Using JWT secret:', jwtSecret.substring(0, 3) + '...');

    const token = jwt.sign(
      {
        sub: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    // Create response with token
    const nextResponse = NextResponse.json({
      access_token: token,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }
    });
    
    // Set cookies for both client and server
    nextResponse.cookies.set({
      name: 'token',
      value: token,
      httpOnly: false, // Allow JavaScript access for client-side auth
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });
    
    // Also set HTTP-only cookie for server-side auth
    nextResponse.cookies.set({
      name: 'auth_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });
    
    return nextResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
