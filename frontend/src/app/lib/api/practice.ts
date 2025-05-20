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

export interface PracticeSet {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  questions?: PracticeQuestion[];
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

export interface CreatePracticeSetDto {
  name: string;
  description: string;
  questionIds: string[];
}

// Practice Questions API

// Get all practice questions
export async function getPracticeQuestions(): Promise<PracticeQuestion[]> {
  try {
    console.log('Fetching all practice questions');
    const response = await fetchAPI('/api/practice/questions');
    console.log(`Fetched ${response.length} practice questions`);
    return response;
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    return [];
  }
}

// Get random practice questions
export const getRandomPracticeQuestions = async (count: number = 10): Promise<PracticeQuestion[]> => {
  return fetchAPI(`/api/practice/questions/random?count=${count}`);
};

// Get a single practice question by ID
export const getPracticeQuestion = async (id: string): Promise<PracticeQuestion> => {
  return fetchAPI(`/api/practice/questions/${id}`);
};

// Create a new practice question
export const createPracticeQuestion = async (data: CreatePracticeQuestionDto): Promise<PracticeQuestion> => {
  return fetchAPI('/api/practice/questions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update a practice question
export const updatePracticeQuestion = async (id: string, data: Partial<CreatePracticeQuestionDto>): Promise<PracticeQuestion> => {
  return fetchAPI(`/api/practice/questions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Delete a practice question
export const deletePracticeQuestion = async (id: string): Promise<void> => {
  return fetchAPI(`/api/practice/questions/${id}`, {
    method: 'DELETE',
  });
};

// Practice Sets API

// Get all practice sets
export const getPracticeSets = async (): Promise<PracticeSet[]> => {
  return fetchAPI('/api/practice/sets');
};

// Get a practice set by ID
export async function getPracticeSet(id: string, withQuestions: boolean = false): Promise<PracticeSet> {
  const response = await fetchAPI(`/api/practice/sets/${id}${withQuestions ? '?withQuestions=true' : ''}`);
  return response;
}

// Create a new practice set
export const createPracticeSet = async (data: CreatePracticeSetDto): Promise<PracticeSet> => {
  return fetchAPI('/api/practice/sets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update a practice set
export const updatePracticeSet = async (id: string, data: Partial<CreatePracticeSetDto>): Promise<PracticeSet> => {
  return fetchAPI(`/api/practice/sets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Delete a practice set
export const deletePracticeSet = async (id: string): Promise<void> => {
  return fetchAPI(`/api/practice/sets/${id}`, {
    method: 'DELETE',
  });
};





