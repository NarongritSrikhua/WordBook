import { User } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  
  return response.json();
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}

export async function setUserAdmin(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/users/${id}/set-admin`, {
    method: 'PATCH',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to set user as admin');
  }
  
  return response.json();
} 