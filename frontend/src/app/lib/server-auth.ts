import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Session } from './auth';

// Get session from server-side cookies
export async function getServerSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth_session')?.value;
    
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
    console.error('Error getting server session:', error);
    return null;
  }
}