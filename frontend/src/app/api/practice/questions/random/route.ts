import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromCookie } from '@/app/lib/auth/cookies';

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  try {
    // Get count and category from query params
    const { searchParams } = new URL(request.url);
    const count = searchParams.get('count') || '10';
    const category = searchParams.get('category');
    
    console.log(`[API] Fetching random questions. Count: ${count}, Category: ${category || 'All'}`);
    
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
    
    // Build the URL with query parameters
    let url = `${backendUrl}/practice/questions/random?count=${count}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    console.log(`[API] Calling backend endpoint: ${url}`);
    
    const response = await fetch(url, {
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error(`[API] Backend error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Double-check category filtering on the frontend side
    let filteredData = data;
    if (category) {
      console.log(`[API] Filtering questions by category: ${category}`);
      filteredData = data.filter(q => q.category === category);
      
      // If filtering resulted in too few questions, fetch more to compensate
      if (filteredData.length < parseInt(count) && filteredData.length < data.length) {
        console.log(`[API] After filtering, only ${filteredData.length} questions remain. Fetching more...`);
        // Try to fetch more questions to make up the difference
        const moreNeeded = parseInt(count) - filteredData.length;
        const moreUrl = `${backendUrl}/practice/questions/random?count=${moreNeeded + 5}&category=${encodeURIComponent(category)}`;
        
        try {
          const moreResponse = await fetch(moreUrl, { headers, credentials: 'include' });
          if (moreResponse.ok) {
            const moreData = await moreResponse.json();
            const moreFiltered = moreData.filter(q => 
              q.category === category && 
              !filteredData.some(existing => existing.id === q.id)
            );
            
            filteredData = [...filteredData, ...moreFiltered].slice(0, parseInt(count));
            console.log(`[API] Added ${moreFiltered.length} more questions, total: ${filteredData.length}`);
          }
        } catch (err) {
          console.error('[API] Error fetching additional questions:', err);
        }
      }
    }
    
    console.log(`[API] Returning ${filteredData.length} random questions`);
    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error fetching random practice questions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch random practice questions' },
      { status: 500 }
    );
  }
}

