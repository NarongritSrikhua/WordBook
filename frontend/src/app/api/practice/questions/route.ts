import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract token from cookie
function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

// GET all practice questions
export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count') || '10';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    
    // Build the query string
    let queryString = `count=${count}`;
    if (category) queryString += `&category=${category}`;
    if (difficulty) queryString += `&difficulty=${difficulty}`;
    
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
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/practice/questions/random?${queryString}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Filter out invalid questions
    const validQuestions = data.filter((question: any) => {
      // For word-type fill questions, ensure fillWord exists
      if (question.type === 'fill' && question.fillType === 'word' && !question.fillWord) {
        console.warn(`Filtering out invalid word-type fill question (ID: ${question.id}): Missing fillWord`);
        return false;
      }
      
      // For sentence-type fill questions, ensure fillPrompt exists and contains ___
      if (question.type === 'fill' && question.fillType === 'sentence' && 
          (!question.fillPrompt || !question.fillPrompt.includes('___'))) {
        console.warn(`Filtering out invalid sentence-type fill question (ID: ${question.id}): Missing or invalid fillPrompt`);
        return false;
      }
      
      return true;
    });
    
    return NextResponse.json(validQuestions);
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch practice questions', error: String(error) },
      { status: 500 }
    );
  }
}

// POST create a new practice question
export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Parse the request body
    const body = await request.json();
    console.log('[API] Creating practice question with body:', body);
    
    // Ensure fillPrompt is present for fill-type questions
    if (body.type === 'fill' && !body.fillPrompt) {
      console.error('[API] Missing fillPrompt for fill-type question');
      return NextResponse.json(
        { message: ["fillPrompt should not be empty"] },
        { status: 400 }
      );
    }
    
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
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/practice/questions`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error('Backend error status:', response.status);
      let errorDetails;
      
      try {
        // Try to parse as JSON first
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await response.json();
          console.error('Backend error details:', errorDetails);
        } else {
          // Fall back to text
          const errorText = await response.text();
          console.error('Backend error details:', errorText || 'Empty response');
          errorDetails = { message: errorText };
        }
      } catch (parseError) {
        console.error('Error parsing backend error response:', parseError);
        errorDetails = { message: 'Could not parse error details' };
      }
      
      return NextResponse.json(
        errorDetails || { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating practice question:', error);
    return NextResponse.json(
      { message: 'Failed to create practice question', error: String(error) },
      { status: 500 }
    );
  }
}



