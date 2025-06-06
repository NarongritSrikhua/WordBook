// API functions for flashcards
import { fetchAPI } from './fetch';
import { Flashcard } from '@/app/types/flashcard';

export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  lastReviewed?: Date | null;
  nextReview?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface GetFlashcardsParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  category?: string;
}

// Get all flashcards
export async function getFlashcards(params?: GetFlashcardsParams): Promise<PaginatedResponse<Flashcard>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortField) queryParams.append('sortField', params.sortField);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);

  const response = await fetchAPI(`/api/flashcards?${queryParams.toString()}`);
  return response;
}

// Get a single flashcard
export async function getFlashcard(id: string): Promise<Flashcard> {
  return fetchAPI(`/api/flashcards/${id}`);
}

// Create a new flashcard
export async function createFlashcard(flashcard: Omit<Flashcard, 'id'>): Promise<Flashcard> {
  console.log('Creating flashcard with data:', flashcard); // Add logging
  return fetchAPI('/api/flashcards', {
    method: 'POST',
    body: JSON.stringify(flashcard)
  });
}

// Delete a flashcard
export async function deleteFlashcard(id: string): Promise<void> {
  console.log(`Deleting flashcard with ID: ${id}`);
  return fetchAPI(`/api/flashcards/${id}`, {
    method: 'DELETE'
  });
}

// Update a flashcard
export async function updateFlashcard(id: string, flashcard: Partial<Flashcard>): Promise<Flashcard> {
  console.log(`Updating flashcard with ID: ${id}`, flashcard);
  return fetchAPI(`/api/flashcards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(flashcard)
  });
}

