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
      console.log('[Categories API] Extracted token from cookie and added to Authorization header');
    }
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  console.log('[Categories API] Headers being sent:', headers);
  return headers;
}

// GET all categories
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  console.log(`[Categories API] Fetching categories from: ${backendUrl}/flashcards/categories`);

  try {
    const headers = buildHeaders(request);
    
    const response = await fetch(`${backendUrl}/flashcards/categories`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    console.log(`[Categories API] Backend response status: ${response.status}`);

    if (response.status === 401) {
      console.log('[Categories API] Authentication failed (401), returning empty array');
      return NextResponse.json([]);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Categories API] Error response:', errorText);
      
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Categories API] Successfully fetched categories:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Categories API] Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories', error: error.toString() },
      { status: 500 }
    );
  }
}

// POST create a new category
export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  console.log('[Categories API] Creating new category');

  try {
    const body = await request.json();
    const headers = buildHeaders(request);

    console.log('[Categories API] Request body:', body);

    const response = await fetch(`${backendUrl}/flashcards/categories`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log(`[Categories API] Backend response status: ${response.status}`);

    if (response.status === 401) {
      console.log('[Categories API] Authentication failed (401), returning error response');
      return NextResponse.json(
        { message: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Categories API] Error response:', errorText);
      
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Categories API] Successfully created category:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Categories API] Error creating category:', error);
    return NextResponse.json(
      { message: 'Failed to create category', error: error.toString() },
      { status: 500 }
    );
  }
}
