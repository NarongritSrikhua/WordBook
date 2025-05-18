import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/flashcards/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(req.headers.get('Authorization') 
          ? { 'Authorization': req.headers.get('Authorization') as string } 
          : {})
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to fetch flashcard' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/flashcards/${id}`, {
      method: 'PUT',
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
        { message: error.message || 'Failed to update flashcard' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/flashcards/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(req.headers.get('Authorization') 
          ? { 'Authorization': req.headers.get('Authorization') as string } 
          : {})
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to delete flashcard' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}