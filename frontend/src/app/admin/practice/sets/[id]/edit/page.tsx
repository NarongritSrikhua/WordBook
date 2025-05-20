'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import { 
  getPracticeSet,
  updatePracticeSet,
  getPracticeQuestions,
  PracticeSet,
  PracticeQuestion
} from '@/app/lib/api/practice';

export default function EditPracticeSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [practiceSet, setPracticeSet] = useState<PracticeSet>();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [practiceSetName, setPracticeSetName] = useState('');
  const [practiceSetDescription, setPracticeSetDescription] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'fill'>('all');
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (isAuthenticated && id) {
      fetchData();
    }
  }, [isAuthenticated, loading, router, id]);

  const fetchData = async () => {
    try {
      setPageLoading(true);
      
      // Fetch practice set
      const setData = await getPracticeSet(id);
      setPracticeSet(setData);
      setPracticeSetName(setData.name);
      setPracticeSetDescription(setData.description || '');
      setSelectedQuestions(setData.questionIds || []);
      
      // Fetch all questions
      const questionsData = await getPracticeQuestions();
      setQuestions(questionsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setPageLoading(false);
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
      await updatePracticeSet(id, {
        name: practiceSetName,
        description: practiceSetDescription,
        questionIds: selectedQuestions
      });
      
      router.push(`/admin/practice/sets/${id}`);
    } catch (err) {
      console.error('Error updating practice set:', err);
      setError('Failed to update practice set');
    }
  };

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
                          <div className="flex items-center mb-2">
                            <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded mr-2">
                              {question.type.toUpperCase()}
                            </span>
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() => {}}
                              className="h-4 w-4 text-[#ff6b8b] focus:ring-[#ff6b8b] border-gray-300 rounded"
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

