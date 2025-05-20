'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getPracticeQuestions, 
  createPracticeSet, 
  PracticeQuestion,
  Difficulty,
  PracticeSetType
} from '@/app/lib/api/practice';
import { getCategories, Category } from '@/app/lib/api/categories';

export default function CreatePracticeSetPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [practiceSetName, setPracticeSetName] = useState('');
  const [practiceSetDescription, setPracticeSetDescription] = useState('');
  const [practiceSetDifficulty, setPracticeSetDifficulty] = useState<Difficulty>('medium');
  const [practiceSetCategory, setPracticeSetCategory] = useState('');
  const [practiceSetType, setPracticeSetType] = useState<PracticeSetType>('mixed');
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'fill'>('all');

  // Auth protection
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.replace('/login');
    } else if (!loading && isAuthenticated && user && user.role !== 'admin') {
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
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Don't set error state here to avoid blocking the main functionality
    }
  };

  const handleToggleQuestion = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const handleSelectAll = () => {
    const filteredQuestionIds = filteredQuestions.map(q => q.id);
    if (selectedQuestions.length === filteredQuestionIds.length) {
      // If all are selected, deselect all
      setSelectedQuestions([]);
    } else {
      // Otherwise, select all filtered questions
      setSelectedQuestions(filteredQuestionIds);
    }
  };

  const handleCreatePracticeSet = async () => {
    if (!practiceSetName.trim()) {
      setError('Practice set name is required');
      return;
    }

    if (selectedQuestions.length === 0) {
      setError('Please select at least one question');
      return;
    }

    try {
      await createPracticeSet({
        name: practiceSetName,
        description: practiceSetDescription,
        questionIds: selectedQuestions,
        difficulty: practiceSetDifficulty,
        category: practiceSetCategory,
        type: practiceSetType
      });
      
      router.push('/admin/practice/sets');
    } catch (err) {
      console.error('Error creating practice set:', err);
      setError('Failed to create practice set');
    }
  };

  // Determine the practice set type based on selected questions
  useEffect(() => {
    if (selectedQuestions.length === 0) {
      setPracticeSetType('mixed');
      return;
    }

    const selectedQuestionObjects = questions.filter(q => selectedQuestions.includes(q.id));
    const types = new Set(selectedQuestionObjects.map(q => q.type));

    if (types.size === 1) {
      // If all selected questions are of the same type
      setPracticeSetType(selectedQuestionObjects[0].type as 'text' | 'image' | 'fill');
    } else {
      // If there are multiple types
      setPracticeSetType('mixed');
    }
  }, [selectedQuestions, questions]);

  // Filter questions based on search term and type
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      searchTerm === '' || 
      question.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.fillPrompt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      question.type === filterType;
    
    return matchesSearch && matchesType;
  });

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
        <h1 className="text-3xl font-bold">Create Practice Set</h1>
        <Link 
          href="/admin/practice"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center"
        >
          Back to Questions
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Practice Set Details */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Practice Set Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={practiceSetName}
                  onChange={(e) => setPracticeSetName(e.target.value)}
                  placeholder="e.g., Basic Vocabulary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  value={practiceSetDescription}
                  onChange={(e) => setPracticeSetDescription(e.target.value)}
                  placeholder="Brief description of this practice set"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="relative">
                  <select
                    value={practiceSetType}
                    onChange={(e) => setPracticeSetType(e.target.value as PracticeSetType)}
                    className="w-full p-2 border rounded-md appearance-none"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="fill">Fill in the Blank</option>
                    <option value="mixed">Mixed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {practiceSetType === 'mixed' 
                    ? 'Mixed type includes different question types' 
                    : `All questions will be of type: ${practiceSetType}`}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <div className="relative">
                  <select
                    value={practiceSetDifficulty}
                    onChange={(e) => setPracticeSetDifficulty(e.target.value as Difficulty)}
                    className="w-full p-2 border rounded-md appearance-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={practiceSetCategory}
                    onChange={(e) => setPracticeSetCategory(e.target.value)}
                    className="w-full p-2 border rounded-md appearance-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Selected Questions</p>
                <p className="text-2xl font-bold text-[#ff6b8b]">{selectedQuestions.length}</p>
              </div>
              
              <button
                onClick={handleCreatePracticeSet}
                disabled={selectedQuestions.length === 0 || !practiceSetName.trim()}
                className={`w-full py-2 rounded-md text-white font-medium ${
                  selectedQuestions.length === 0 || !practiceSetName.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#ff6b8b] hover:bg-[#ff5277]'
                }`}
              >
                Create Practice Set
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column - Question Selection */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Questions</h2>
            
            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="w-full p-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filterType === 'all' 
                      ? 'bg-[#ff6b8b] text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('text')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filterType === 'text' 
                      ? 'bg-[#ff6b8b] text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setFilterType('image')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filterType === 'image' 
                      ? 'bg-[#ff6b8b] text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => setFilterType('fill')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filterType === 'fill' 
                      ? 'bg-[#ff6b8b] text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Fill
                </button>
              </div>
            </div>
            
            {/* Select all button */}
            <div className="mb-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-[#ff6b8b] hover:text-[#ff5277] font-medium"
              >
                {selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>
            
            {pageLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b8b]"></div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No questions found matching your criteria.
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredQuestions.map((question) => (
                  <div 
                    key={question.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedQuestions.includes(question.id)
                        ? 'border-[#ff6b8b] bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleToggleQuestion(question.id)}
                          className="h-5 w-5 text-[#ff6b8b] rounded border-gray-300 focus:ring-[#ff6b8b]"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                            question.type === 'text' ? 'bg-blue-100 text-blue-800' : 
                            question.type === 'image' ? 'bg-green-100 text-green-800' : 
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">ID: {question.id.slice(0, 8)}...</span>
                        </div>
                        
                        {question.type === 'text' && (
                          <div className="mb-2">
                            <span className="font-medium">Word:</span> {question.word}
                          </div>
                        )}
                        
                        {question.type === 'image' && question.imageUrl && (
                          <div className="mb-2">
                            <span className="font-medium">Image:</span> 
                            <div className="mt-1 relative h-12 w-12 inline-block">
                              <Image
                                src={question.imageUrl}
                                alt="Question image"
                                fill
                                style={{ objectFit: 'contain' }}
                                className="rounded"
                              />
                            </div>
                          </div>
                        )}
                        
                        {question.type === 'fill' && (
                          <div className="mb-2">
                            <span className="font-medium">Prompt:</span> {question.fillPrompt}<br />
                            <span className="font-medium">Answer:</span> {question.answer}
                          </div>
                        )}
                        
                        <div>
                          <span className="font-medium">Translation:</span> {question.translation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



