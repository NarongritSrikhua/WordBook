'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getPracticeQuestions, 
  createPracticeQuestion, 
  updatePracticeQuestion as updatePracticeQuestionApi, 
  deletePracticeQuestion as deletePracticeQuestionApi,
  PracticeQuestion,
  CreatePracticeQuestionDto
} from '@/app/lib/api/practice';
import { getCategories } from '@/app/lib/api/categories';
import { getFlashcards } from '@/app/lib/api/flashcards';

interface NewQuestionForm extends CreatePracticeQuestionDto {}

export default function AdminPracticePage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PracticeQuestion | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState<NewQuestionForm>({
    type: 'text',
    word: '',
    translation: '',
    options: ['', '', '', ''],
    fillPrompt: '',
    fillWord: '',
    fillType: 'sentence',
    answer: '',
    difficulty: 'medium',
    category: '',
  });
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcardSelector, setShowFlashcardSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);

  // Auth protection
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      console.log('Not authenticated, redirecting to login');
      router.replace('/login');
    } else if (!loading && isAuthenticated && user && user.role !== 'admin') {
      console.log('Not admin, redirecting to unauthorized');
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, user, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchQuestions();
      fetchCategories();
    }
  }, [isAuthenticated, user]);

  const fetchQuestions = async () => {
    try {
      setPageLoading(true);
      const data = await getPracticeQuestions();
      setQuestions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load practice questions');
    } finally {
      setPageLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        // Default categories if none are returned
        setCategories(['General Knowledge', 'Mathematics', 'Science', 'History', 'Geography', 'Language']);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set default categories to avoid breaking the UI
      setCategories(['General Knowledge', 'Mathematics', 'Science', 'History', 'Geography', 'Language']);
    }
  };

  const handleAddQuestion = async () => {
    try {
      // Create a base question data object
      const questionData: CreatePracticeQuestionDto = {
        type: newQuestion.type,
        difficulty: newQuestion.difficulty || 'medium',
        category: newQuestion.category || 'General',
      };

      // Add type-specific fields
      if (newQuestion.type === 'text') {
        // For text-type questions
        if (!newQuestion.word) {
          setError('Word is required for text questions');
          return;
        }
        if (!newQuestion.translation) {
          setError('Translation is required');
          return;
        }
        if (!newQuestion.options || newQuestion.options.length < 2) {
          setError('At least 2 options are required');
          return;
        }

        questionData.word = newQuestion.word;
        questionData.translation = newQuestion.translation;
        questionData.options = newQuestion.options;
      } 
      else if (newQuestion.type === 'image') {
        // For image-type questions
        if (!newQuestion.imageUrl) {
          setError('Image URL is required for image questions');
          return;
        }
        if (!newQuestion.translation) {
          setError('Translation is required');
          return;
        }
        if (!newQuestion.options || newQuestion.options.length < 2) {
          setError('At least 2 options are required');
          return;
        }

        questionData.imageUrl = newQuestion.imageUrl;
        questionData.translation = newQuestion.translation;
        questionData.options = newQuestion.options;
      } 
      else if (newQuestion.type === 'fill') {
        // For fill-in-the-blank questions
        questionData.fillType = newQuestion.fillType;
        
        if (newQuestion.fillType === 'sentence') {
          if (!newQuestion.fillPrompt || !newQuestion.fillPrompt.includes('___')) {
            setError('Fill prompt must include ___ (three underscores) to mark the blank');
            return;
          }
          if (!newQuestion.answer) {
            setError('Answer is required');
            return;
          }

          questionData.fillPrompt = newQuestion.fillPrompt;
          questionData.answer = newQuestion.answer;
          questionData.translation = newQuestion.translation || newQuestion.answer; // Use answer as translation if not provided
        } 
        else if (newQuestion.fillType === 'word') {
          if (!newQuestion.fillWord || !newQuestion.fillWord.includes('_')) {
            setError('Word with blanks must include _ (underscore) to mark missing letters');
            return;
          }
          if (!newQuestion.answer) {
            setError('Answer is required');
            return;
          }

          questionData.fillPrompt = newQuestion.fillPrompt || "Fill in the missing letters";
          questionData.fillWord = newQuestion.fillWord;
          questionData.answer = newQuestion.answer;
          questionData.translation = newQuestion.translation || newQuestion.answer; // Use answer as translation if not provided
        }
      }

      // Submit the question
      const response = await createPracticeQuestion(questionData);
      
      // Reset form
      setNewQuestion({
        type: 'text',
        word: '',
        translation: '',
        options: ['', '', '', ''],
        fillPrompt: '',
        fillWord: '',
        fillType: 'sentence',
        answer: '',
        difficulty: 'medium',
        category: categories.length > 0 ? categories[0].name : '',
      });
      
      setShowAddQuestion(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding question:', err);
      
      // Extract the most useful error message
      let errorMessage = 'Failed to add practice question';
      
      if (err.data && err.data.message) {
        // Handle array of validation errors
        if (Array.isArray(err.data.message)) {
          errorMessage = err.data.message.join(', ');
        } else {
          errorMessage = err.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    
    try {
      // Same validation as add
      if (editingQuestion.type === 'text' && (!editingQuestion.word || !editingQuestion.translation)) {
        setError('Word and translation are required for text questions');
        return;
      }
      
      if (editingQuestion.type === 'image' && (!editingQuestion.imageUrl || !editingQuestion.translation)) {
        setError('Image URL and translation are required for image questions');
        return;
      }
      
      if (editingQuestion.type === 'fill' && (!editingQuestion.fillPrompt || !editingQuestion.answer || !editingQuestion.translation)) {
        setError('Fill prompt, answer, and translation are required for fill-in-the-blank questions');
        return;
      }
      
      if ((editingQuestion.type === 'text' || editingQuestion.type === 'image') && 
          (!editingQuestion.options || editingQuestion.options.some(opt => !opt))) {
        setError('All four options are required for text and image questions');
        return;
      }
      
      if ((editingQuestion.type === 'text' || editingQuestion.type === 'image') && 
          !editingQuestion.options?.includes(editingQuestion.translation)) {
        setError('Options must include the correct translation');
        return;
      }

      // Create a copy without createdAt and updatedAt
      const { createdAt, updatedAt, ...updateData } = editingQuestion;
      
      const updatedQuestion = await updatePracticeQuestionApi(editingQuestion.id, updateData);
      
      setQuestions(questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      ));
      
      setShowEditQuestion(false);
      setEditingQuestion(null);
      setError(null);
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update practice question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await deletePracticeQuestionApi(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete practice question');
    }
  };

  const handleEditQuestion = (question: PracticeQuestion) => {
    setEditingQuestion(question);
    setShowEditQuestion(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({...newQuestion, options: newOptions});
    
    // Check if translation is not in options, replace the last option with translation
    if (newQuestion.translation && !newOptions.includes(newQuestion.translation)) {
      // Find the first empty option or use the last one
      const emptyIndex = newOptions.findIndex(opt => !opt);
      const indexToReplace = emptyIndex !== -1 ? emptyIndex : 3;
      
      newOptions[indexToReplace] = newQuestion.translation;
      setNewQuestion({...newQuestion, options: newOptions});
    }
  };

  const handleEditOptionChange = (index: number, value: string) => {
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({...editingQuestion, options: newOptions});
    
    // Check if translation is not in options, replace the last option with translation
    if (editingQuestion.translation && !newOptions.includes(editingQuestion.translation)) {
      // Find the first empty option or use the last one
      const emptyIndex = newOptions.findIndex(opt => !opt);
      const indexToReplace = emptyIndex !== -1 ? emptyIndex : 3;
      
      newOptions[indexToReplace] = editingQuestion.translation;
      setEditingQuestion({...editingQuestion, options: newOptions});
    }
  };

  const handleTranslationChange = (value) => {
    // Update the translation
    setNewQuestion({...newQuestion, translation: value});
    
    // If we have options, make sure the translation is included
    if (newQuestion.options && newQuestion.options.length > 0) {
      const newOptions = [...newQuestion.options];
      
      // If translation is not in options, replace the last option with translation
      if (value && !newOptions.includes(value)) {
        // Find the first empty option or use the last one
        const emptyIndex = newOptions.findIndex(opt => !opt);
        const indexToReplace = emptyIndex !== -1 ? emptyIndex : 3;
        
        newOptions[indexToReplace] = value;
        setNewQuestion({...newQuestion, translation: value, options: newOptions});
      }
    }
  };

  const handleEditTranslationChange = (value) => {
    // Update the translation
    setEditingQuestion({...editingQuestion, translation: value});
    
    // If we have options, make sure the translation is included
    if (editingQuestion.options && editingQuestion.options.length > 0) {
      const newOptions = [...editingQuestion.options];
      
      // If translation is not in options, replace the last option with translation
      if (value && !newOptions.includes(value)) {
        // Find the first empty option or use the last one
        const emptyIndex = newOptions.findIndex(opt => !opt);
        const indexToReplace = emptyIndex !== -1 ? emptyIndex : 3;
        
        newOptions[indexToReplace] = value;
        setEditingQuestion({...editingQuestion, translation: value, options: newOptions});
      }
    }
  };

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const data = await getFlashcards();
        setFlashcards(data);
        setFilteredFlashcards(data);
      } catch (err) {
        console.error('Error fetching flashcards:', err);
      }
    };
    
    fetchFlashcards();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFlashcards(flashcards);
    } else {
      const filtered = flashcards.filter(card => 
        card.front.toLowerCase().includes(searchTerm.toLowerCase()) || 
        card.back.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFlashcards(filtered);
    }
  }, [searchTerm, flashcards]);

  const selectFlashcard = (flashcard) => {
    if (showEditQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        word: flashcard.front,
        translation: flashcard.back
      });
    } else {
      setNewQuestion({
        ...newQuestion,
        word: flashcard.front,
        translation: flashcard.back
      });
    }
    setShowFlashcardSelector(false);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b8b]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Practice Question Management</h1>
        <button 
          onClick={() => setShowAddQuestion(true)}
          className="bg-[#ff6b8b] hover:bg-[#ff5277] text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Question
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {pageLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b8b]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {questions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No practice questions found.</p>
              <button 
                onClick={() => setShowAddQuestion(true)}
                className="bg-[#ff6b8b] hover:bg-[#ff5277] text-white px-4 py-2 rounded-md"
              >
                Create Your First Question
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => (
                    <tr key={question.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {question.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {question.type === 'text' && (
                          <div className="text-sm font-medium text-gray-900">{question.word}</div>
                        )}
                        {question.type === 'image' && (
                          <div className="text-sm font-medium text-gray-900">
                            {question.imageUrl ? (
                              <img src={question.imageUrl} alt="Question" className="h-10 w-10 object-cover rounded" />
                            ) : (
                              'No image'
                            )}
                          </div>
                        )}
                        {question.type === 'fill' && (
                          <div className="text-sm font-medium text-gray-900">{question.fillPrompt}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {question.type === 'fill' ? question.answer : question.translation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            question.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {question.difficulty ? question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) : 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {question.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Question Modal with scrolling capability */}
      {showAddQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black opacity-50" 
            onClick={() => setShowAddQuestion(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50 relative my-8 mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Practice Question</h2>
              <button
                onClick={() => setShowAddQuestion(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as 'text' | 'image' | 'fill'})}
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="fill">Fill in the Blank</option>
                </select>
              </div>

              {newQuestion.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={newQuestion.word || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, word: e.target.value})}
                    />
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setShowFlashcardSelector(true)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#ff6b8b] hover:bg-[#ff5277] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6b8b]"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Select from Flashcards
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={newQuestion.translation || ''}
                      onChange={(e) => handleTranslationChange(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Options (Multiple Choice)</label>
                    <div className="space-y-2">
                      {newQuestion.options?.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: One option must match the translation exactly.
                    </p>
                  </div>
                </>
              )}

              {newQuestion.type === 'image' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={newQuestion.imageUrl || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, imageUrl: e.target.value})}
                    />
                  </div>
                  
                  {/* Add image preview */}
                  {newQuestion.imageUrl && (
                    <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={newQuestion.imageUrl} 
                        alt="Preview" 
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                          e.currentTarget.alt = 'Invalid image URL';
                        }}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={newQuestion.translation || ''}
                      onChange={(e) => handleTranslationChange(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Options (Multiple Choice)</label>
                    <div className="space-y-2">
                      {newQuestion.options?.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: One option must match the translation exactly.
                    </p>
                  </div>
                </>
              )}

              {newQuestion.type === 'fill' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fill-in-the-blank Type</label>
                    <select
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={newQuestion.fillType || 'sentence'}
                      onChange={(e) => setNewQuestion({...newQuestion, fillType: e.target.value as 'sentence' | 'word'})}
                    >
                      <option value="sentence">Sentence with blank</option>
                      <option value="word">Word with missing letters</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose whether to create a sentence with a missing word or a word with missing letters.
                    </p>
                  </div>

                  {newQuestion.fillType === 'sentence' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sentence with Blank</label>
                      <div className="mb-2">
                        <textarea
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={newQuestion.fillPrompt || ''}
                          onChange={(e) => setNewQuestion({...newQuestion, fillPrompt: e.target.value})}
                          rows={3}
                          placeholder="Enter text with ___ for the blank"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use ___ (three underscores) to indicate the blank. Example: "I ___ to the store."
                        </p>
                      </div>
                      
                      {/* Preview for sentence type */}
                      {newQuestion.fillPrompt && (
                        <div className="p-3 bg-gray-50 rounded-md mb-3">
                          <p className="text-sm font-medium text-gray-500 mb-1">Preview:</p>
                          <p className="text-gray-800">
                            {newQuestion.fillPrompt.split('___').map((part, index, array) => (
                              <React.Fragment key={index}>
                                {part}
                                {index < array.length - 1 && (
                                  <span className="inline-block w-16 h-6 bg-gray-200 rounded mx-1 align-middle"></span>
                                )}
                              </React.Fragment>
                            ))}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Word with Missing Letters</label>
                      <div className="mb-2">
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={newQuestion.fillWord || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewQuestion({
                              ...newQuestion, 
                              fillWord: value,
                              // Don't auto-generate the answer anymore
                            });
                          }}
                          placeholder="Enter word with _ for missing letters (e.g. ap_le)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use _ (single underscore) for each missing letter. Example: "ap_le" for "apple"
                        </p>
                      </div>
                      
                      {/* Add custom prompt field for word-type questions */}
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Prompt (Optional)</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={newQuestion.fillPrompt || ''}
                          onChange={(e) => setNewQuestion({...newQuestion, fillPrompt: e.target.value})}
                          placeholder="Enter custom prompt or leave empty for default"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Default: "Fill in the missing letters"
                        </p>
                      </div>
                      
                      {/* Preview for word type */}
                      {newQuestion.fillWord && (
                        <div className="p-3 bg-gray-50 rounded-md mb-3">
                          <p className="text-sm font-medium text-gray-500 mb-1">Preview:</p>
                          <div className="flex items-center justify-center space-x-1">
                            {newQuestion.fillWord.split('').map((char, index) => (
                              <div key={index} className="text-center">
                                {char === '_' ? (
                                  <div className="w-8 h-8 border-b-2 border-gray-400 flex items-center justify-center">
                                    <span className="invisible">X</span>
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 flex items-center justify-center">
                                    <span className="text-lg">{char}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complete Word
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={newQuestion.answer || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, answer: e.target.value})}
                      placeholder="Complete word without blanks"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the complete word (e.g. "apple" for "ap_le")
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={newQuestion.translation || ''}
                      onChange={(e) => setNewQuestion({...newQuestion, translation: e.target.value})}
                      placeholder="Translation of the full sentence or word"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={newQuestion.category || ''}
                  onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category, index) => (
                    <option 
                      key={typeof category === 'string' ? category : (category.id || `category-${index}`)} 
                      value={typeof category === 'string' ? category : category.name}
                    >
                      {typeof category === 'string' ? category : category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                  value={newQuestion.difficulty || 'medium'}
                  onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddQuestion(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-[#ff6b8b] hover:bg-[#ff5277] text-white rounded-md focus:outline-none"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal with scrolling capability */}
      {showEditQuestion && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black opacity-50" 
            onClick={() => setShowEditQuestion(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50 relative my-8 mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Practice Question</h2>
              <button
                onClick={() => setShowEditQuestion(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                  value={editingQuestion.type}
                  onChange={(e) => setEditingQuestion({...editingQuestion, type: e.target.value as 'text' | 'image' | 'fill'})}
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="fill">Fill in the Blank</option>
                </select>
              </div>

              {editingQuestion.type === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={editingQuestion.word || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, word: e.target.value})}
                    />
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setShowFlashcardSelector(true)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#ff6b8b] hover:bg-[#ff5277] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6b8b]"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Select from Flashcards
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={editingQuestion.translation || ''}
                      onChange={(e) => handleEditTranslationChange(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Options (Multiple Choice)</label>
                    <div className="space-y-2">
                      {editingQuestion.options?.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={option}
                          onChange={(e) => handleEditOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: One option must match the translation exactly.
                    </p>
                  </div>
                </>
              )}

              {editingQuestion.type === 'image' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={editingQuestion.imageUrl || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, imageUrl: e.target.value})}
                    />
                  </div>
                  
                  {/* Add image preview */}
                  {editingQuestion.imageUrl && (
                    <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={editingQuestion.imageUrl} 
                        alt="Preview" 
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                          e.currentTarget.alt = 'Invalid image URL';
                        }}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={editingQuestion.translation || ''}
                      onChange={(e) => handleEditTranslationChange(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Options (Multiple Choice)</label>
                    <div className="space-y-2">
                      {editingQuestion.options?.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={option}
                          onChange={(e) => handleEditOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: One option must match the translation exactly.
                    </p>
                  </div>
                </>
              )}

              {editingQuestion.type === 'fill' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fill-in-the-blank Type</label>
                    <select
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={editingQuestion.fillType || 'sentence'}
                      onChange={(e) => setEditingQuestion({...editingQuestion, fillType: e.target.value as 'sentence' | 'word'})}
                    >
                      <option value="sentence">Sentence with blank</option>
                      <option value="word">Word with missing letters</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose whether to create a sentence with a missing word or a word with missing letters.
                    </p>
                  </div>

                  {editingQuestion.fillType === 'sentence' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sentence with Blank</label>
                      <div className="mb-2">
                        <textarea
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={editingQuestion.fillPrompt || ''}
                          onChange={(e) => setEditingQuestion({...editingQuestion, fillPrompt: e.target.value})}
                          rows={3}
                          placeholder="Enter text with ___ for the blank"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use ___ (three underscores) to indicate the blank. Example: "I ___ to the store."
                        </p>
                      </div>
                      
                      {/* Preview for sentence type */}
                      {editingQuestion.fillPrompt && (
                        <div className="p-3 bg-gray-50 rounded-md mb-3">
                          <p className="text-sm font-medium text-gray-500 mb-1">Preview:</p>
                          <p className="text-gray-800">
                            {editingQuestion.fillPrompt.split('___').map((part, index, array) => (
                              <React.Fragment key={index}>
                                {part}
                                {index < array.length - 1 && (
                                  <span className="inline-block w-16 h-6 bg-gray-200 rounded mx-1 align-middle"></span>
                                )}
                              </React.Fragment>
                            ))}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Word with Missing Letters</label>
                      <div className="mb-2">
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={editingQuestion.fillWord || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEditingQuestion({
                              ...editingQuestion, 
                              fillWord: value,
                              // Automatically update the answer to be the word without underscores
                              answer: value.replace(/_/g, '')
                            });
                          }}
                          placeholder="Enter word with _ for missing letters (e.g. ap_le)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use _ (single underscore) for each missing letter. Example: "ap_le" for "apple"
                        </p>
                      </div>
                      
                      {/* Add custom prompt field for word-type questions in edit form */}
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Prompt (Optional)</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                          value={editingQuestion.fillPrompt || ''}
                          onChange={(e) => setEditingQuestion({...editingQuestion, fillPrompt: e.target.value})}
                          placeholder="Enter custom prompt or leave empty for default"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Default: "Fill in the missing letters"
                        </p>
                      </div>
                      
                      {/* Preview for word type */}
                      {editingQuestion.fillWord && (
                        <div className="p-3 bg-gray-50 rounded-md mb-3">
                          <p className="text-sm font-medium text-gray-500 mb-1">Preview:</p>
                          <div className="flex items-center justify-center space-x-1">
                            {editingQuestion.fillWord.split('').map((char, index) => (
                              <div key={index} className="text-center">
                                {char === '_' ? (
                                  <div className="w-8 h-8 border-b-2 border-gray-400 flex items-center justify-center">
                                    <span className="invisible">X</span>
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 flex items-center justify-center">
                                    <span className="text-lg">{char}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingQuestion.fillType === 'sentence' ? 'Answer (word that goes in the blank)' : 'Complete Word'}
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={editingQuestion.answer || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, answer: e.target.value})}
                      placeholder={editingQuestion.fillType === 'sentence' ? "Word that goes in the blank" : "Complete word without blanks"}
                      readOnly={editingQuestion.fillType === 'word'} // Make it read-only for word type as it's auto-generated
                    />
                    {editingQuestion.fillType === 'word' && (
                      <p className="text-xs text-gray-500 mt-1">
                        This is automatically generated from your word with blanks.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Translation</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                      value={editingQuestion.translation || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, translation: e.target.value})}
                      placeholder="Translation of the full sentence or word"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="edit-category"
                  value={editingQuestion.category || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category, index) => (
                    <option 
                      key={typeof category === 'string' ? category : (category.id || `category-${index}`)} 
                      value={typeof category === 'string' ? category : category.name}
                    >
                      {typeof category === 'string' ? category : category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                  value={editingQuestion.difficulty || 'medium'}
                  onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditQuestion(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuestion}
                className="px-4 py-2 bg-[#ff6b8b] hover:bg-[#ff5277] text-white rounded-md focus:outline-none"
              >
                Update Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard Selector Modal with scrolling capability */}
      {showFlashcardSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black opacity-50" 
            onClick={() => setShowFlashcardSelector(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50 relative my-8 mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Select a Flashcard</h2>
              <button
                onClick={() => setShowFlashcardSelector(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search flashcards..."
                className="w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredFlashcards.length > 0 ? (
                filteredFlashcards.map((flashcard) => (
                  <div
                    key={flashcard.id}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => selectFlashcard(flashcard)}
                  >
                    <div className="font-medium text-gray-800">{flashcard.front}</div>
                    <div className="text-gray-500 text-sm mt-1">{flashcard.back}</div>
                    {flashcard.category && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {flashcard.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {searchTerm ? 'No flashcards match your search' : 'No flashcards available'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






























