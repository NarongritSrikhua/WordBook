// Extract token from cookie
export function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
  
  if (!tokenCookie) return null;
  
  return tokenCookie.split('=')[1];
}