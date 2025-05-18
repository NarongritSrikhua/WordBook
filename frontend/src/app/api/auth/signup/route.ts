import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../lib/users';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { name, email, password } = await req.json();
    
    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if email is already in use
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already in use' },
        { status: 409 }
      );
    }
    
    // For demo purposes, just add to our in-memory array
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password, // In a real app, this would be hashed
      role: 'user' // Add default role
    };

    users.push(newUser);

    console.log('User registered:', email);
    console.log('Current users:', users);
    
    // Return success without exposing the password
    return NextResponse.json(
      { 
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
