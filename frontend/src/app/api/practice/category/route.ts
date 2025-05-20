import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromCookie } from '@/app/lib/auth/cookies';

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    console.log('[API] Fetching practice categories');
    
    // Forward the authorization header or extract from cookie
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if we have a token
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Try different possible backend endpoints
    const possibleEndpoints = [
      `${backendUrl}/practice/categories`,
      `${backendUrl}/practice/category`,
      `${backendUrl}/practice/questions/categories`
    ];
    
    let response = null;
    let endpointUsed = '';
    
    // Try each endpoint until one works
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`[API] Trying endpoint: ${endpoint}`);
        const tempResponse = await fetch(endpoint, {
          headers,
          credentials: 'include'
        });
        
        if (tempResponse.ok) {
          response = tempResponse;
          endpointUsed = endpoint;
          console.log(`[API] Successfully connected to ${endpoint}`);
          break;
        } else {
          console.log(`[API] Endpoint ${endpoint} returned ${tempResponse.status}`);
        }
      } catch (err) {
        console.log(`[API] Error connecting to ${endpoint}:`, err);
      }
    }
    
    // If no endpoint worked, try a fallback approach - get all questions and extract categories
    if (!response) {
      console.log('[API] No category endpoint found, trying to extract from questions');
      try {
        const questionsResponse = await fetch(`${backendUrl}/practice/questions`, {
          headers,
          credentials: 'include'
        });
        
        if (questionsResponse.ok) {
          const questions = await questionsResponse.json();
          // Extract unique categories from questions
          const uniqueCategories = [...new Set(questions
            .map(q => q.category)
            .filter(Boolean)
          )];
          console.log('[API] Extracted categories from questions:', uniqueCategories);
          return NextResponse.json(uniqueCategories);
        }
      } catch (err) {
        console.error('[API] Error fetching questions for category extraction:', err);
      }
      
      // If we still can't get categories, return a default set
      console.error('[API] Could not fetch categories from any endpoint');
      return NextResponse.json([
        'General Knowledge',
        'Mathematics',
        'Science',
        'History',
        'Geography',
        'Language'
      ]);
    }
    
    const data = await response.json();
    console.log(`[API] Successfully fetched categories from ${endpointUsed}:`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching practice categories:', error);
    // Return default categories as fallback
    return NextResponse.json([
      'General Knowledge',
      'Mathematics',
      'Science',
      'History',
      'Geography',
      'Language'
    ]);
  }
}
