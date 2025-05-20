import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Session type
export interface Session {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Extract token from cookie or Authorization header
export function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get from Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Then try to get from cookie
  const token = req.cookies.get('auth_session')?.value;
  if (token) {
    return token;
  }
  
  // Also check for token cookie
  const tokenCookie = req.cookies.get('token')?.value;
  if (tokenCookie) {
    return tokenCookie;
  }
  
  return null;
}

// Get session from request
export function getSessionFromRequest(req: NextRequest): Session | null {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    console.log('No token found in request');
    return null;
  }
  
  try {
    // Verify JWT token - use the same secret as in login route
    const jwtSecret = process.env.JWT_SECRET || 'Ghs7f$8z!bXxZk1@WqPl3n2R';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role || 'user'
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    
    // For development/testing, you can implement a fallback
    if (process.env.NODE_ENV !== 'production') {
      // Parse the token as if it were a base64-encoded JSON
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          return {
            id: payload.sub || payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role || 'user'
          };
        }
      } catch (e) {
        console.error('Failed to parse token as JWT:', e);
      }
      
      // Last resort: if the token looks like a UUID, use it as the user ID
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
        return {
          id: token,
          name: 'User',
          email: 'user@example.com',
          role: 'user'
        };
      }
    }
    
    return null;
  }
}

// Client-side function to get the current session
export function getClientSession(): Session | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // For client-side, we can't verify the JWT signature,
    // but we can decode the payload to get the user info
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return {
      id: payload.sub || payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role || 'user'
    };
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
}

// Set session in localStorage
export function setSession(session: Session): void {
  // In a real app, you'd store the JWT token, not the session object
  localStorage.setItem('session', JSON.stringify(session));
}

// Clear session from localStorage
export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('session');
}

// Verify authentication and return user ID if successful
export async function verifyAuth(req: NextRequest): Promise<{ success: boolean; userId?: string }> {
  const session = getSessionFromRequest(req);
  
  if (!session) {
    return { success: false };
  }
  
  return { success: true, userId: session.id };
}
