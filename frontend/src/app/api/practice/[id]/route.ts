import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract token from cookie
function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

// GET a practice question by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have a token (either from header or cookie)
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${backendUrl}/practice/${id}`, {
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
    console.error(`Error fetching practice question ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch practice question' },
      { status: 500 }
    );
  }
}

// PATCH update a practice question
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have a token (either from header or cookie)
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${backendUrl}/practice/${id}`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
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
    console.error(`Error updating practice question ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update practice question' },
      { status: 500 }
    );
  }
}

// DELETE a practice question
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have a token (either from header or cookie)
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${backendUrl}/practice/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting practice question ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete practice question' },
      { status: 500 }
    );
  }
}

