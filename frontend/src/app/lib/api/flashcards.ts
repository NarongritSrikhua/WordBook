// API functions for flashcards
import { fetchAPI } from './fetch';

export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
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

