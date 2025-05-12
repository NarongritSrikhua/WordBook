import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { users } from './users';

export async function getSession() {
  try {
    const cookieStore = cookies();
    const sessionToken = (await cookieStore).get('auth_session')?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    // Extract user ID from session token (format: user_ID_session)
    const userId = sessionToken.split('_')[1];
    if (!userId) return null;
    
    // Find the user with this ID
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    
    // Return user data without password
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function verifySession() {
  return getSession();
}

// Helper function to get session from request object (for middleware)
export function getSessionFromRequest(req: NextRequest) {
  const sessionToken = req.cookies.get('auth_session')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  // Extract user ID from session token (format: user_ID_session)
  const userId = sessionToken.split('_')[1];
  if (!userId) return null;
  
  // Find the user with this ID
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  // Return user data without password
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

