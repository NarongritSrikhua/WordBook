'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPracticeSet, getPracticeQuestions, deletePracticeSet } from '@/app/lib/api/practice';
import { PracticeSet, PracticeQuestion } from '@/app/lib/definitions';

// Simple inline loading component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function PracticeSetDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPracticeSet();
  }, [id]);

  const fetchPracticeSet = async () => {
    try {
      setPageLoading(true);
      const data = await getPracticeSet(id, true); // try to get with questions
      console.log('Fetched practice set data:', data);
      
      // If we have questionIds but no questions, fetch them separately
      if ((!data.questions || data.questions.length === 0) && data.questionIds && data.questionIds.length > 0) {
        console.log('No questions included in response, fetching separately...');
        try {
          // Fetch all questions
          const allQuestions = await getPracticeQuestions();
          console.log(`Fetched ${allQuestions.length} total questions`);
          
          // Filter to only include questions that are in this practice set
          const setQuestions = allQuestions.filter(q => data.questionIds.includes(q.id));
          console.log(`Filtered ${setQuestions.length} questions for this practice set`);
          
          // Add the questions to the practice set data
          data.questions = setQuestions;
        } catch (err) {
          console.error('Error fetching questions separately:', err);
        }
      }
      
      setPracticeSet(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching practice set:', err);
      setError('Failed to load practice set');
    } finally {
      setPageLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this practice set?')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      await deletePracticeSet(id);
      router.push('/admin/practice/sets');
    } catch (err) {
      console.error('Error deleting practice set:', err);
      setError('Failed to delete practice set');
      setDeleteLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchPracticeSet}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!practiceSet) {
    return <div>Practice set not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{practiceSet.name}</h1>
        <div className="space-x-2">
          <Link
            href={`/admin/practice/sets/${id}/edit`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-md">{practiceSet.description || 'No description'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Difficulty</p>
                  <p className={`text-md capitalize px-2 py-1 rounded-md inline-block ${
                    practiceSet.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    practiceSet.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    practiceSet.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {practiceSet.difficulty || 'Medium'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-md bg-blue-100 text-blue-800 px-2 py-1 rounded-md inline-block">
                    {practiceSet.category || 'Uncategorized'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className={`text-md capitalize px-2 py-1 rounded-md inline-block ${
                    practiceSet.type === 'text' ? 'bg-indigo-100 text-indigo-800' :
                    practiceSet.type === 'image' ? 'bg-purple-100 text-purple-800' :
                    practiceSet.type === 'fill' ? 'bg-pink-100 text-pink-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {practiceSet.type || 'Mixed'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Question Count</p>
                <p className="text-md">{practiceSet.questionIds?.length || 0} questions</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-md">{new Date(practiceSet.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-md">{new Date(practiceSet.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Questions */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Questions in this Set</h2>
            
            {practiceSet.questions && practiceSet.questions.length > 0 ? (
              <div className="space-y-4">
                {practiceSet.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center mb-2 gap-2">
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
                          <span className="text-gray-500 text-sm">#{index + 1}</span>
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
                      
                      {/* <Link
                        href={`/admin/practice?edit=${question.id}`}
                        className="text-blue-500 hover:text-blue-700 ml-4"
                      >
                        Edit
                      </Link> */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No questions in this practice set.</p>
                <button 
                  onClick={fetchPracticeSet}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Refresh Questions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}






