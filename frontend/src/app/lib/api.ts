// Base API utility for making requests to the backend

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Make sure endpoint starts with a slassh
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Use the proxy API route
    const response = await fetch(`/api/proxy${normalizedEndpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
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
