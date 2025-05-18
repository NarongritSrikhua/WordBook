import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface Session {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Get session from request (for API routes)
export function getSessionFromRequest(req: NextRequest): Session | null {
  try {
    const token = req.cookies.get('auth_session')?.value || 
                  req.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as any;
    
    if (!decoded) {
      return null;
    }
    
    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}


// Client-side functions
export function getClientSession(): Session | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token') || getCookie('token');
    
    if (!token) {
      return null;
    }
    
    // For client-side, we can't verify the JWT signature properly
    // So we just decode it to get the payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    
    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error getting client session:', error);
    return null;
  }
}

export function setSession(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

// Helper function to get cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}
