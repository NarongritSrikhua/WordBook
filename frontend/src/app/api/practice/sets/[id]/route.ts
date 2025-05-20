import { NextRequest, NextResponse } from 'next/server';

// GET a practice set by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Get withQuestions from query params
    const { searchParams } = new URL(request.url);
    const withQuestions = searchParams.get('withQuestions') === 'true';
    
    console.log(`[Frontend API] Fetching practice set ${id} with withQuestions=${withQuestions}`);
    
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
    
    const backendEndpoint = `${backendUrl}/practice/sets/${id}${withQuestions ? '?withQuestions=true' : ''}`;
    console.log(`[Frontend API] Calling backend endpoint: ${backendEndpoint}`);
    
    const response = await fetch(backendEndpoint, {
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error(`[Frontend API] Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('[Frontend API] Backend response structure:', Object.keys(data));
    console.log('[Frontend API] Practice set type:', data.type);
    
    // Ensure type is properly set
    if (!data.type) {
      console.warn('[Frontend API] No type found in practice set data, defaulting to mixed');
      data.type = 'mixed';
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[Frontend API] Error fetching practice set ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch practice set' },
      { status: 500 }
    );
  }
}

// PATCH update a practice set
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    const body = await request.json();
    
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    // Extract token from cookie if not in header
    const token = extractTokenFromCookie(cookieHeader);
    
    console.log('[PATCH] Auth header:', authHeader);
    console.log('[PATCH] Cookie header:', cookieHeader ? 'Present' : 'Not present');
    console.log('[PATCH] Token from cookie:', token ? 'Present' : 'Not present');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have it
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('[PATCH] Using Authorization header from request');
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[PATCH] Using token from cookie for Authorization header');
    } else {
      console.log('[PATCH] No authorization token found');
    }
    
    console.log('[PATCH] Request body:', JSON.stringify(body));
    console.log('[PATCH] Headers being sent:', headers);
    
    const response = await fetch(`${backendUrl}/practice/sets/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      credentials: 'include'
    });
    
    console.log(`[PATCH] Backend response status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('[PATCH] Authentication failed (401), returning error response');
      return NextResponse.json(
        { message: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PATCH] Error response:', errorText);
      
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[PATCH] Error updating practice set ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update practice set', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE a practice set
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have it
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${backendUrl}/practice/sets/${id}`, {
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
    console.error(`Error deleting practice set ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete practice set' },
      { status: 500 }
    );
  }
}

// Helper function to extract token from cookie
function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}


