// Utility function for making API requests

export async function fetchAPI(url: string, options: RequestInit = {}): Promise<any> {
  console.log(`[fetchAPI] Calling ${url} with method: ${options.method || 'GET'}`);
  
  try {
    // Ensure headers object exists
    if (!options.headers) {
      options.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    // Add credentials to include cookies in the request
    options.credentials = 'include';
    
    console.log(`[fetchAPI] Request options:`, {
      method: options.method,
      headers: options.headers,
      credentials: options.credentials
    });
    
    const response = await fetch(url, options);
    console.log(`[fetchAPI] Response status: ${response.status}`);
    
    // Handle 401 Unauthorized errors
    if (response.status === 401) {
      console.error('[fetchAPI] Authentication failed (401)');
      // Store the current URL to redirect back after login
      const currentPath = window.location.pathname;
      if (typeof window !== 'undefined' && !currentPath.includes('/login')) {
        console.log(`[fetchAPI] Redirecting to login page with redirect=${currentPath}`);
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
      throw new Error('Authentication failed. Please log in again.');
    }
    
    // Handle other error responses
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Backend error: ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('[fetchAPI] Error response data:', errorData);
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        console.error('[fetchAPI] Error response text:', errorText);
      }
      
      throw new Error(errorMessage);
    }
    
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
    
    return {};
  } catch (error) {
    console.error('[fetchAPI] Error:', error);
    throw error;
  }
}
