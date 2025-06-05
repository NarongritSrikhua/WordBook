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
      console.log('[DEBUG] Extracted token from cookie and added to Authorization header');
    }
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  // Debug logs to verify headers
  console.log('[DEBUG] Forwarding headers:', headers);

  return headers;
}

// GET all flashcards
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const url = new URL(request.url);
  const queryParams = url.searchParams.toString();
  const backendUrlWithParams = `${backendUrl}/flashcards${queryParams ? `?${queryParams}` : ''}`;

  console.log(`[GET] Fetching flashcards from: ${backendUrlWithParams}`);

  try {
    const headers = buildHeaders(request);

    const response = await fetch(backendUrlWithParams, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');

    if (!response.ok) {
      // If unauthorized but we want to show public flashcards anyway
      if (response.status === 401) {
        console.log('[GET] Unauthorized but returning empty array for public access');
        return NextResponse.json([]);
      }
      
      const errorBody = isJSON ? await response.json() : await response.text();
      console.error('[GET] Backend error:', response.status, errorBody);
      return NextResponse.json(
        {
          message: `Backend error: ${response.statusText}`,
          details: errorBody,
        },
        { status: response.status }
      );
    }

    const data = isJSON ? await response.json() : {};
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[GET] Unexpected error:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch flashcards',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST create a new flashcard
export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  console.log('[POST] Creating new flashcard');

  try {
    const body = await request.json();
    console.log('[POST] Request body:', body); // Add logging
    const headers = buildHeaders(request);

    const response = await fetch(`${backendUrl}/flashcards`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');

    if (!response.ok) {
      const errorBody = isJSON ? await response.json() : await response.text();
      console.error('[POST] Backend error:', response.status, errorBody);
      return NextResponse.json(
        {
          message: `Backend error: ${response.statusText}`,
          details: errorBody,
        },
        { status: response.status }
      );
    }

    const data = isJSON ? await response.json() : {};
    console.log('[POST] Created flashcard:', data); // Add logging
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[POST] Unexpected error:', error);
    return NextResponse.json(
      {
        message: 'Failed to create flashcard',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
