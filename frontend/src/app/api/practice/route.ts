import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract token from cookie
function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

// GET all practice questions
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    console.log('Auth header:', authHeader);
    console.log('Cookie header:', cookieHeader);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have a token (either from header or cookie)
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using token from cookie for Authorization header');
    }
    
    const response = await fetch(`${backendUrl}/practice`, {
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch practice questions' },
      { status: 500 }
    );
  }
}

// POST create a new practice question
export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    console.log('Auth header:', authHeader);
    console.log('Cookie header:', cookieHeader);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have a token (either from header or cookie)
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using token from cookie for Authorization header');
    }
    
    const response = await fetch(`${backendUrl}/practice`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error('Backend error status:', response.status);
      const errorText = await response.text();
      console.error('Backend error details:', errorText);
      
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating practice question:', error);
    return NextResponse.json(
      { message: 'Failed to create practice question', error: String(error) },
      { status: 500 }
    );
  }
}

