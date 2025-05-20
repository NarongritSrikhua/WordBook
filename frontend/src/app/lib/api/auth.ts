import { fetchAPI } from './fetch';

// Get the current user's session
export async function getCurrentSession(): Promise<any> {
  try {
    const response = await fetchAPI('/api/auth/session', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}
