import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/flashcards/${id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(req.headers.get('Authorization') 
          ? { 'Authorization': req.headers.get('Authorization') as string } 
          : {})
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to review flashcard' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reviewing flashcard:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
