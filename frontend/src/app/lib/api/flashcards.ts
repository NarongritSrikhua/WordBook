// API functions for flashcards
import { fetchAPI } from './fetch';

export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date | null;
  nextReview?: Date | null;
}

// Get all flashcards
export async function getFlashcards(): Promise<Flashcard[]> {
  return fetchAPI('/api/flashcards');
}

// Get a single flashcard
export async function getFlashcard(id: string): Promise<Flashcard> {
  return fetchAPI(`/api/flashcards/${id}`);
}

// Create a new flashcard
export async function createFlashcard(flashcard: Omit<Flashcard, 'id'>): Promise<Flashcard> {
  return fetchAPI('/api/flashcards', {
    method: 'POST',
    body: JSON.stringify(flashcard)
  });
}

// Update a flashcard
export async function updateFlashcard(id: string, flashcard: Partial<Flashcard>): Promise<Flashcard> {
  console.log(`Updating flashcard with ID: ${id}`, flashcard);
  const response = await fetchAPI(`/api/flashcards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(flashcard)
  });
  
  if (!response || !response.id) {
    console.error('Update failed - received invalid response:', response);
    throw new Error('Failed to update flashcard - invalid response from server');
  }
  
  return response;
}

// Delete a flashcard
export async function deleteFlashcard(id: string): Promise<void> {
  console.log(`Deleting flashcard with ID: ${id}`);
  return fetchAPI(`/api/flashcards/${id}`, {
    method: 'DELETE'
  });
}

// Review a flashcard
export async function reviewFlashcard(id: string, isCorrect: boolean): Promise<Flashcard> {
  return fetchAPI(`/api/flashcards/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ isCorrect })
  });
}
