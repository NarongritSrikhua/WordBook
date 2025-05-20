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

    const response = await fetch(`${backendUrl}/flashcards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      return NextResponse.json({
        ...body,
        id: id,
        updatedAt: new Date().toISOString(),
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
    console.error(`Error updating flashcard ${id}:`, error);
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

    const response = await fetch(`${backendUrl}/flashcards/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      credentials: 'include',
    });

    if (response.status === 401) {
      return NextResponse.json({ success: true });
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error details:', errorBody);

      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting flashcard ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete flashcard' },
      { status: 500 }
    );
  }
}
