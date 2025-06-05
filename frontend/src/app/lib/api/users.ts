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
  }
}

export async function setUserAdmin(id: string): Promise<User> {
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
} 