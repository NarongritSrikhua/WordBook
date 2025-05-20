import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromCookie } from '@/app/lib/auth/cookies';

// GET all practice sets
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have it
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${backendUrl}/practice/sets`, {
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
    console.error('Error fetching practice sets:', error);
    return NextResponse.json(
      { message: 'Failed to fetch practice sets' },
      { status: 500 }
    );
  }
}

// POST create a new practice set
export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    const body = await request.json();
    
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    console.log('[POST] Creating practice set with data:', body);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have a token (either from header or cookie)
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('[POST] Using Authorization header from request');
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[POST] Using token from cookie for Authorization header');
    } else {
      console.log('[POST] No authorization token found');
    }
    
    const response = await fetch(`${backendUrl}/practice/sets`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error('[POST] Backend error status:', response.status);
      const errorText = await response.text();
      console.error('[POST] Backend error details:', errorText);
      
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('[POST] Practice set created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[POST] Error creating practice set:', error);
    return NextResponse.json(
      { message: 'Failed to create practice set', error: String(error) },
      { status: 500 }
    );
  }
}


