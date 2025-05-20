import { fetchAPI } from './fetch';

export interface PracticeQuestion {
  id: string;
  type: 'text' | 'image' | 'fill';
  word?: string;
  imageUrl?: string;
  translation: string;
  options?: string[];
  fillPrompt?: string;
  answer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePracticeQuestionDto {
  type: 'text' | 'image' | 'fill';
  word?: string;
  imageUrl?: string;
  translation: string;
  options?: string[];
  fillPrompt?: string;
  answer?: string;
}

// Get all practice questions
export const getPracticeQuestions = async (): Promise<PracticeQuestion[]> => {
  return fetchAPI('/api/practice');
};

// Get random practice questions
export const getRandomPracticeQuestions = async (count: number = 10): Promise<PracticeQuestion[]> => {
  return fetchAPI(`/api/practice/random?count=${count}`);
};

// Get a single practice question by ID
export const getPracticeQuestion = async (id: string): Promise<PracticeQuestion> => {
  return fetchAPI(`/api/practice/${id}`);
};

// Create a new practice question
export const createPracticeQuestion = async (data: CreatePracticeQuestionDto): Promise<PracticeQuestion> => {
  return fetchAPI('/api/practice', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Update a practice question
export const updatePracticeQuestion = async (id: string, data: Partial<CreatePracticeQuestionDto>): Promise<PracticeQuestion> => {
  return fetchAPI(`/api/practice/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

// Delete a practice question
export const deletePracticeQuestion = async (id: string): Promise<void> => {
  return fetchAPI(`/api/practice/${id}`, {
    method: 'DELETE'
  });
};
