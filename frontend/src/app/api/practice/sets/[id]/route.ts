import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract token from cookie
function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

// GET a practice set by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Get withQuestions from query params
    const { searchParams } = new URL(request.url);
    const withQuestions = searchParams.get('withQuestions') === 'true';
    
    console.log(`[Frontend API] Fetching practice set ${id} with withQuestions=${withQuestions}`);
    
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
    console.log('[Frontend API] Has questions:', data.questions ? `Yes (${data.questions.length})` : 'No');
    
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
    
    const response = await fetch(`${backendUrl}/practice/sets/${id}`, {
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
    console.error(`Error updating practice set ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update practice set' },
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


