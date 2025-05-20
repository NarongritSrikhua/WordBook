import { fetchAPI } from './fetch';

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  return fetchAPI('/api/flashcards/categories');
}

// Create a new category
export async function createCategory(name: string): Promise<Category> {
  return fetchAPI('/api/flashcards/categories', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
}

// Update a category
export async function updateCategory(id: string, name: string): Promise<Category> {
  return fetchAPI(`/api/flashcards/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name })
  });
}

// Delete a category
export async function deleteCategory(id: string): Promise<void> {
  return fetchAPI(`/api/flashcards/categories/${id}`, {
    method: 'DELETE'
  });
}
