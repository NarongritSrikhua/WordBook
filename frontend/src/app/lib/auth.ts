import { fetchApi } from './api';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function login(email: string, password: string) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return fetchApi('/auth/logout', {
    method: 'POST',
  });
}

export function getSessionFromRequest(request: NextRequest) {
  const cookie = request.cookies.get('auth_session');
  if (!cookie?.value) return null;
  
  try {
    return JSON.parse(atob(cookie.value.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const cookie = (await cookieStore).get('auth_session');
  if (!cookie?.value) return null;
  
  try {
    return JSON.parse(atob(cookie.value.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export function isAdmin(session: any) {
  return session?.role === 'admin';
}


