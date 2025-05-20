import { NextRequest, NextResponse } from 'next/server';

// GET a single flashcard
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  try {
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${backendUrl}/flashcards/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      return NextResponse.json({
        id: id,
        front: 'Sample Question',
        back: 'Sample Answer',
        category: 'General',
        difficulty: 'medium',
        lastReviewed: new Date().toISOString(),
        nextReview: new Date(Date.now() + 86400000).toISOString(),
      });
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error details:', errorBody);

      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching flashcard ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch flashcard' },
      { status: 500 }
    );
  }
}

// PUT update a flashcard
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  try {
    const body = await request.json();
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';
    
    console.log(`[PUT] Updating flashcard ${id} with data:`, body);
    console.log(`[PUT] Sending request to: ${backendUrl}/flashcards/${id}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } 
    // Extract token from cookie if no auth header is present
    else if (cookieHeader) {
      const tokenMatch = cookieHeader.match(/token=([^;]+)/);
      if (tokenMatch && tokenMatch[1]) {
        headers['Authorization'] = `Bearer ${tokenMatch[1]}`;
        console.log('[PUT] Extracted token from cookie and added to Authorization header');
      }
    }

    console.log('[PUT] Headers being sent:', headers);

    const response = await fetch(`${backendUrl}/flashcards/${id}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });
    
    console.log(`[PUT] Backend response status: ${response.status}`);

    if (response.status === 401) {
      console.log('[PUT] Authentication failed (401), returning error response');
      return NextResponse.json(
        { message: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[PUT] Error details:', errorBody);

      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[PUT] Successfully updated flashcard, response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[PUT] Error updating flashcard ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update flashcard' },
      { status: 500 }
    );
  }
}

// DELETE a flashcard
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';
    
    console.log(`[DELETE] Deleting flashcard ${id}`);
    console.log(`[DELETE] Sending request to: ${backendUrl}/flashcards/${id}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } 
    // Extract token from cookie if no auth header is present
    else if (cookieHeader) {
      const tokenMatch = cookieHeader.match(/token=([^;]+)/);
      if (tokenMatch && tokenMatch[1]) {
        headers['Authorization'] = `Bearer ${tokenMatch[1]}`;
        console.log('[DELETE] Extracted token from cookie and added to Authorization header');
      }
    }

    console.log('[DELETE] Headers being sent:', headers);

    const response = await fetch(`${backendUrl}/flashcards/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    
    console.log(`[DELETE] Backend response status: ${response.status}`);

    if (response.status === 401) {
      console.log('[DELETE] Authentication failed (401), returning error response');
      return NextResponse.json(
        { message: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[DELETE] Error details:', errorBody);

      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE] Error deleting flashcard ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete flashcard' },
      { status: 500 }
    );
  }
}
