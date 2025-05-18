import { fetchApi } from '../api';

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date | null;
  nextReview: Date | null;
}

export async function getFlashcards() {
  return fetchApi('/flashcards');
}

export async function getFlashcard(id: number) {
  return fetchApi(`/flashcards/${id}`);
}

export async function createFlashcard(flashcard: Omit<Flashcard, 'id' | 'lastReviewed' | 'nextReview'>) {
  return fetchApi('/flashcards', {
    method: 'POST',
    body: JSON.stringify(flashcard),
  });
}

export async function updateFlashcard(id: number, flashcard: Partial<Omit<Flashcard, 'id'>>) {
  return fetchApi(`/flashcards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(flashcard),
  });
}

export async function deleteFlashcard(id: number) {
  return fetchApi(`/flashcards/${id}`, {
    method: 'DELETE',
  });
}

export async function reviewFlashcard(id: number, isCorrect: boolean) {
  return fetchApi(`/flashcards/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ isCorrect }),
  });
}