// Extract token from cookie string
export function extractTokenFromCookie(cookieString?: string | null): string | null {
  if (!cookieString) return null;
  
  // Try to extract the token from different possible cookie names
  const tokenCookieNames = ['token', 'auth_token', 'auth_session', 'next-auth.session-token'];
  
  for (const cookieName of tokenCookieNames) {
    const match = new RegExp(`${cookieName}=([^;]+)`).exec(cookieString);
    if (match) {
      console.log(`Found token in cookie: ${cookieName}`);
      return match[1];
    }
  }
  
  console.log('No token found in cookies:', cookieString);
  return null;
}
