import { NextRequest, NextResponse } from 'next/server';

// Helper to build headers from request
function buildHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
    
    // Extract token from cookie if present
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (tokenMatch && tokenMatch[1]) {
      headers['Authorization'] = `Bearer ${tokenMatch[1]}`;
    }
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  return headers;
}

// PUT update a category
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  try {
    const body = await request.json();
    const headers = buildHeaders(request);

    const response = await fetch(`${backendUrl}/flashcards/categories/${id}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[PUT] Error updating category ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE a category
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  try {
    const headers = buildHeaders(request);

    const response = await fetch(`${backendUrl}/flashcards/categories/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE] Error deleting category ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete category' },
      { status: 500 }
    );
  }
}