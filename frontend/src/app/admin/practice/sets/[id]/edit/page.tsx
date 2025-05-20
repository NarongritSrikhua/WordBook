'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { use } from 'react';
import { 
  getPracticeSet,
  updatePracticeSet,
  getPracticeQuestions, // Make sure this is imported
  PracticeSet,
  PracticeQuestion,
  Difficulty,
  PracticeSetType
} from '@/app/lib/api/practice';
import { getCategories, Category } from '@/app/lib/api/categories';

export default function EditPracticeSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
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

  // Add this at the top of your component to track component lifecycle
  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component unmounted');
    };
  }, []);

  // Auth protection
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.replace('/login');
    } else if (!loading && isAuthenticated && user && user.role !== 'admin') {
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, user, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && id) {
      fetchPracticeSet();
      fetchQuestions();
      fetchCategories();
    }
  }, [isAuthenticated, user, id]);

  const fetchPracticeSet = async () => {
    try {
      console.log('Fetching practice set with ID:', id);
      const data = await getPracticeSet(id);
      console.log('Raw practice set data from API:', data);
      
      // Check if type exists in the data
      if (data.type) {
        console.log('Practice set type from database:', data.type);
      } else {
        console.log('No type found in practice set data, defaulting to mixed');
      }
      
      // Set the practice set data
      setPracticeSet(data);
      
      // Set individual form fields
      setPracticeSetName(data.name || '');
      setPracticeSetDescription(data.description || '');
      setPracticeSetDifficulty(data.difficulty || 'medium');
      setPracticeSetCategory(data.category || '');
      
      // Explicitly set the type with a delay to ensure it's not overridden
      setTimeout(() => {
        console.log('Setting practice set type to:', data.type || 'mixed');
        setPracticeSetType(data.type || 'mixed');
      }, 0);
      
      setSelectedQuestions(data.questionIds || []);
      setPageLoading(false);
    } catch (err) {
      console.error('Error fetching practice set:', err);
      setError('Failed to load practice set');
      setPageLoading(false);
    }
  };

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

  const handleUpdatePracticeSet = async () => {
    if (!practiceSetName.trim()) {
      setError('Practice set name is required');
      return;
    }

    if (selectedQuestions.length === 0) {
      setError('Please select at least one question');
      return;
    }

    try {
      setPageLoading(true);
      const updateData = {
        name: practiceSetName,
        description: practiceSetDescription,
        questionIds: selectedQuestions,
        difficulty: practiceSetDifficulty,
        category: practiceSetCategory,
        type: practiceSetType
      };
      
      console.log('Updating practice set with data:', updateData);
      
      await updatePracticeSet(id, updateData);
      
      router.push(`/admin/practice/sets/${id}`);
    } catch (err: any) {
      console.error('Error updating practice set:', err);
      
      if (err.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        }, 2000);
      } else {
        setError(`Failed to update practice set: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setPageLoading(false);
    }
  };

  // Add a useEffect to log state changes
  useEffect(() => {
    console.log('Current practice set type state:', practiceSetType);
  }, [practiceSetType]);

  const toggleQuestionSelection = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const filteredQuestions = questions.filter(question => {
    // Filter by search term
    const matchesSearch = 
      question.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.fillPrompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by type
    const matchesType = filterType === 'all' || question.type === filterType;
    
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
        <h1 className="text-3xl font-bold">Edit Practice Set</h1>
        <Link 
          href={`/admin/practice/sets/${id}`}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center"
        >
          Back to Set Details
        </Link>
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
                      onChange={(e) => {
                        console.log('Type manually changed to:', e.target.value);
                        setPracticeSetType(e.target.value as PracticeSetType);
                      }}
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
                  onClick={handleUpdatePracticeSet}
                  disabled={selectedQuestions.length === 0 || !practiceSetName.trim()}
                  className={`w-full py-2 rounded-md text-white font-medium ${
                    selectedQuestions.length === 0 || !practiceSetName.trim()
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#ff6b8b] hover:bg-[#ff5277]'
                  }`}
                >
                  Update Practice Set
                </button>
              </div>
            </div>
          </div>
          
          {/* Right column - Question Selection */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Select Questions</h2>
              
              <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    className="w-full p-2 border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'text' | 'image' | 'fill')}
                  >
                    <option value="all">All Types</option>
                    <option value="text">Text Only</option>
                    <option value="image">Image Only</option>
                    <option value="fill">Fill in the Blank</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map(question => (
                    <div 
                      key={question.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedQuestions.includes(question.id) 
                          ? 'border-[#ff6b8b] bg-pink-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleQuestionSelection(question.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2 gap-2">
                            <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                              {question.type.toUpperCase()}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            question.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                            }`}>
                              {question.difficulty?.toUpperCase() || 'MEDIUM'}
                            </span>
                            {question.category && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                {question.category}
                              </span>
                            )}
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() => {}}
                              className="h-4 w-4 text-[#ff6b8b] focus:ring-[#ff6b8b] border-gray-300 rounded ml-auto"
                            />
                          </div>
                          
                          {question.type === 'text' && (
                            <div className="mb-2">
                              <p className="font-medium text-lg">{question.word}</p>
                              <p className="text-green-600">Answer: {question.translation}</p>
                            </div>
                          )}
                          
                          {question.type === 'image' && (
                            <div className="mb-2">
                              {question.imageUrl && (
                                <div className="mb-2">
                                  <Image 
                                    src={question.imageUrl} 
                                    alt="Question image" 
                                    width={100} 
                                    height={100} 
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                              <p className="text-green-600">Answer: {question.translation}</p>
                            </div>
                          )}
                          
                          {question.type === 'fill' && (
                            <div className="mb-2">
                              <p className="font-medium text-lg">{question.fillPrompt}</p>
                              <p className="text-green-600">Answer: {question.answer}</p>
                            </div>
                          )}
                          
                          {(question.type === 'text' || question.type === 'image') && question.options && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-500 mb-1">Options:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {question.options.map((option, optIndex) => (
                                  <div 
                                    key={optIndex} 
                                    className={`p-2 rounded text-sm ${
                                      option === question.translation 
                                        ? 'bg-green-100 border border-green-300' 
                                        : 'bg-gray-100 border border-gray-200'
                                    }`}
                                  >
                                    {option}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No questions found matching your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}








