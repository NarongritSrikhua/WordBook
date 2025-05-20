'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getPracticeQuestions, 
  createPracticeSet,
  PracticeQuestion
} from '@/app/lib/api/practice';

export default function CreatePracticeSetPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [practiceSetName, setPracticeSetName] = useState('');
  const [practiceSetDescription, setPracticeSetDescription] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image' | 'fill'>('all');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (isAuthenticated) {
      fetchQuestions();
    }
  }, [isAuthenticated, loading, router]);

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
        questionIds: selectedQuestions
      });
      
      router.push('/admin/practice/sets');
    } catch (err) {
      console.error('Error creating practice set:', err);
      setError('Failed to create practice set');
    }
  };

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