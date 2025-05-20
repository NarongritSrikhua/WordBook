// Utility function for making API requests

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Make sure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const response = await fetch(normalizedEndpoint, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API error: ${response.status}`, errorData);
      const error = new Error(errorData.message || `API request failed with status ${response.status}`);
      throw error;
    }

    return response.json();
  } catch (error) {
    console.error(`Network error for ${endpoint}:`, error);
    throw error;
  }
}