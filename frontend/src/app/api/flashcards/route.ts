import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/flashcards`, {
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
        { message: error.message || 'Failed to fetch flashcards' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/flashcards`, {
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
        { message: error.message || 'Failed to create flashcard' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}