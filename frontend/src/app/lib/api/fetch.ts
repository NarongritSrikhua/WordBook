// Utility function for making API requests

export const fetchAPI = async (url: string, options: RequestInit = {}): Promise<any> => {
  // Get the token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Prepare headers with authentication
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  // Make the request with authentication
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });
  
  // Handle non-OK responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || response.statusText || 'API request failed');
    throw Object.assign(error, {
      status: response.status,
      data: errorData
    });
  }
  
  // Parse and return the response
  return response.json();
};
