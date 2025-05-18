import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const path = pathSegments.join('/');
  const url = `${backendUrl}/${path}`;
  
  console.log(`Proxying ${method} request to: ${url}`);
  console.log('Path segments:', pathSegments);
  
  try {
    let requestBody;
    if (method !== 'GET') {
      requestBody = await request.text();
      console.log('Request body being sent to backend:', requestBody);
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(
          // Filter out headers that might cause issues
          [...request.headers.entries()].filter(
            ([key]) => !['host', 'connection', 'content-length'].includes(key.toLowerCase())
          )
        ),
      },
      body: requestBody,
    });
    
    console.log('Backend response status:', response.status);
    
    const responseText = await response.text();
    console.log('Raw response from backend:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse backend response as JSON:', e);
      return NextResponse.json(
        { message: 'Invalid response from backend server' },
        { status: 500 }
      );
    }
    
    console.log('Parsed backend response:', data);
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { message: 'Failed to connect to backend server', error: String(error) },
      { status: 500 }
    );
  }
}


