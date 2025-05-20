import { NextRequest, NextResponse } from 'next/server';

// POST review a flashcard
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Get request body
    const body = await request.json();
    
    // Forward the authorization header
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${backendUrl}/flashcards/${id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
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
    console.error(`Error reviewing flashcard ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to review flashcard' },
      { status: 500 }
    );
  }
}
