import { fetchAPI } from './fetch';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type PracticeSetType = 'text' | 'image' | 'fill' | 'mixed';

export interface PracticeQuestion {
  id: string;
  type: 'text' | 'image' | 'fill';
  word?: string;
  imageUrl?: string;
  translation: string;
  options?: string[];
  fillPrompt?: string;
  fillWord?: string;
  fillType?: 'sentence' | 'word';
  answer?: string;
  difficulty?: Difficulty;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeSet {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  questions?: PracticeQuestion[];
  difficulty?: Difficulty;
  category?: string;
  type?: PracticeSetType;
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
  fillWord?: string;
  fillType?: 'sentence' | 'word';
  answer?: string;
  difficulty?: Difficulty;
  category?: string;
}

export interface CreatePracticeSetDto {
  name: string;
  description: string;
  questionIds: string[];
  difficulty?: Difficulty;
  category?: string;
  type?: PracticeSetType;
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
export const getRandomPracticeQuestions = async (count = 10, category?: string): Promise<PracticeQuestion[]> => {
  let url = `/api/practice/questions/random?count=${count}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  return fetchAPI(url);
};

// Get all available categories
export const getCategories = async (): Promise<string[]> => {
  return fetchAPI('/api/practice/category');
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
export async function getPracticeSets(): Promise<PracticeSet[]> {
  try {
    console.log('Fetching all practice sets');
    const response = await fetch('/api/practice/sets');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch practice sets: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching practice sets:', error);
    throw error;
  }
}

// Get a practice set by ID
export async function getPracticeSet(id: string, withQuestions: boolean = false): Promise<PracticeSet> {
  try {
    console.log(`Fetching practice set ${id} with withQuestions=${withQuestions}`);
    const response = await fetch(`/api/practice/sets/${id}${withQuestions ? '?withQuestions=true' : ''}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch practice set: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching practice set:', error);
    throw error;
  }
}

// Create a practice set
export async function createPracticeSet(data: Partial<PracticeSet>): Promise<PracticeSet> {
  try {
    console.log('[API] Creating practice set with data:', data);
    const response = await fetch('/api/practice/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.status === 401) {
      console.error('[API] Authentication failed (401)');
      // Redirect to login page
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] Error creating practice set:', errorData);
      const error = new Error(errorData.message || response.statusText || 'API request failed');
      throw Object.assign(error, {
        status: response.status,
        data: errorData
      });
    }
    
    // Parse and return the response
    const responseData = await response.json();
    console.log('[API] Practice set created successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('[API] Error in createPracticeSet:', error);
    throw error;
  }
}

// Update a practice set
export async function updatePracticeSet(id: string, data: Partial<PracticeSet>): Promise<PracticeSet> {
  try {
    console.log(`[API] Updating practice set ${id} with data:`, data);
    const response = await fetch(`/api/practice/sets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.status === 401) {
      console.error('[API] Authentication failed (401)');
      // Redirect to login page
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] Error updating practice set:', errorData);
      const error = new Error(errorData.message || response.statusText || 'API request failed');
      throw Object.assign(error, {
        status: response.status,
        data: errorData
      });
    }
    
    // Parse and return the response
    const responseData = await response.json();
    console.log('[API] Practice set updated successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('[API] Error in updatePracticeSet:', error);
    throw error;
  }
}

// Delete a practice set
export const deletePracticeSet = async (id: string): Promise<void> => {
  console.log(`[API] Deleting practice set with ID: ${id}`);
  try {
    await fetchAPI(`/api/practice/sets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      credentials: 'include'
    });
    console.log(`[API] Successfully deleted practice set with ID: ${id}`);
  } catch (error) {
    console.error(`[API] Error deleting practice set ${id}:`, error);
    throw error;
  }
};

// Practice History API

// Get practice history
export async function getPracticeHistory(
  userId: string,
  forceRefresh = false, 
  timestamp?: number
): Promise<any[]> {
  try {
    console.log(`Fetching practice history for user ${userId} with forceRefresh:`, forceRefresh);
    
    // Add a cache-busting parameter to ensure we get fresh data
    const ts = timestamp || new Date().getTime();
    const url = `/api/practice/history?userId=${encodeURIComponent(userId)}&_=${ts}${forceRefresh ? '&force=true' : ''}`;
    
    console.log(`Fetching from URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Force-Refresh': forceRefresh ? 'true' : 'false',
        'X-User-ID': userId // Add user ID to headers as well
      },
      cache: 'no-store',
      next: { revalidate: 0 } // For Next.js 13+
    });
    
    if (!response.ok) {
      console.error(`Error fetching practice history: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch practice history: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} practice history entries for user ${userId}`);
    return data;
  } catch (error) {
    console.error('Error in getPracticeHistory:', error);
    throw error;
  }
}

// Submit practice result
export async function submitPracticeResult(data: {
  userId?: string | null;
  category?: string;
  practiceSetId?: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeTaken?: number;
}): Promise<any> {
  try {
    // If no userId is provided and we're in development, use a test ID
    if (!data.userId && process.env.NODE_ENV !== 'production') {
      console.log('No userId provided, using test ID for development');
      data.userId = 'test-user-' + Math.floor(Math.random() * 1000);
    }
    
    console.log('Submitting practice result:', data);
    
    const response = await fetch('/api/practice/submit-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from API:', errorText);
      throw new Error(`Failed to submit practice result: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Practice result submitted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error submitting practice result:', error);
    throw error;
  }
}
