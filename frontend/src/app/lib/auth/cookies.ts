/**
 * Extracts the JWT token from the cookie header
 * @param cookieHeader The cookie header string
 * @returns The token or null if not found
 */
export function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  // Try to match the token cookie
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  if (tokenMatch && tokenMatch[1]) {
    return tokenMatch[1];
  }
  
  // If not found, try to match the jwt cookie (alternative name)
  const jwtMatch = cookieHeader.match(/jwt=([^;]+)/);
  if (jwtMatch && jwtMatch[1]) {
    return jwtMatch[1];
  }
  
  return null;
}
