<<<<<<< HEAD
import { User } from '../../context/AuthContext';
import { fetchAPI } from './fetch';

export async function getUsers(): Promise<User[]> {
  try {
    console.log('[API] Fetching users');
    const users = await fetchAPI('/api/users');
    console.log(`[API] Fetched ${users.length} users`);
    return users;
  } catch (error) {
    console.error('[API] Error fetching users:', error);
    throw error;
  }
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  try {
    console.log(`[API] Updating user ${id} with data:`, data);
    const updatedUser = await fetchAPI(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    console.log('[API] User updated successfully:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('[API] Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    console.log(`[API] Deleting user ${id}`);
    await fetchAPI(`/api/users/${id}`, {
      method: 'DELETE',
    });
    console.log(`[API] User ${id} deleted successfully`);
  } catch (error) {
    console.error('[API] Error deleting user:', error);
    throw error;
=======
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
>>>>>>> f35172e8b6f3902f72ae92c2649719ae28026fb4
  }
}

export async function setUserAdmin(id: string): Promise<User> {
<<<<<<< HEAD
  try {
    console.log(`[API] Setting user ${id} as admin`);
    const updatedUser = await fetchAPI(`/api/users/${id}/set-admin`, {
      method: 'PATCH',
    });
    console.log('[API] User set as admin successfully:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('[API] Error setting user as admin:', error);
    throw error;
  }
=======
  const response = await fetch(`${API_URL}/users/${id}/set-admin`, {
    method: 'PATCH',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to set user as admin');
  }
  
  return response.json();
>>>>>>> f35172e8b6f3902f72ae92c2649719ae28026fb4
} 