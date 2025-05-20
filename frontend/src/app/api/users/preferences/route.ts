import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, getSessionFromRequest, getTokenFromRequest } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.userId;
    
    // Forward the request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const token = getTokenFromRequest(request);
    
    const response = await fetch(`${backendUrl}/users/${userId}/preferences`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      // If backend fails, return mock data for development
      if (process.env.NODE_ENV !== 'production') {
        const preferences = {
          level: 'Intermediate',
          targetLanguage: 'Thai',
          dailyGoal: '30 minutes',
          theme: 'light',
          notifications: true,
          soundEffects: true
        };
        
        return NextResponse.json(preferences);
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch user preferences' },
        { status: response.status }
      );
    }
    
    const preferences = await response.json();
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.userId;
    const preferences = await request.json();
    
    // Forward the request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const token = getTokenFromRequest(request);
    
    console.log(`[PUT Preferences] Sending to backend: ${backendUrl}/users/${userId}/preferences`);
    console.log(`[PUT Preferences] Data:`, preferences);
    
    const response = await fetch(`${backendUrl}/users/${userId}/preferences`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    });
    
    if (!response.ok) {
      console.error(`[PUT Preferences] Backend error: ${response.status}`);
      
      // If backend fails but we're in development, simulate success
      if (process.env.NODE_ENV !== 'production') {
        console.log('[PUT Preferences] Simulating successful update in development mode');
        return NextResponse.json({ 
          message: 'Preferences updated successfully (simulated)',
          preferences
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to update user preferences' },
        { status: response.status }
      );
    }
    
    const updatedPreferences = await response.json();
    return NextResponse.json({ 
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}
