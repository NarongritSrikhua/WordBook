'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PracticeCompletionProps {
  category?: string;
  practiceSetId?: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken?: number;
}

export default function PracticeCompletion({
  category,
  practiceSetId,
  totalQuestions,
  correctAnswers,
  timeTaken
}: PracticeCompletionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  console.log('PracticeCompletion component mounted with props:', {
    category,
    practiceSetId,
    totalQuestions,
    correctAnswers,
    score,
    timeTaken
  });
  
  useEffect(() => {
    // Submit the practice result when the component mounts
    async function submitResult() {
      if (submitted) return;
      
      try {
        setIsSubmitting(true);
        console.log('Submitting practice result:', {
          category,
          practiceSetId,
          totalQuestions,
          correctAnswers,
          score,
          timeTaken
        });
        
        const response = await fetch('/api/practice/submit-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category,
            practiceSetId,
            totalQuestions,
            correctAnswers,
            score,
            timeTaken
          })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Practice result submitted successfully:', result);
        setSubmitted(true);
      } catch (err) {
        console.error('Failed to submit practice result:', err);
        setError('Failed to save your practice result. Your progress may not be recorded.');
      } finally {
        setIsSubmitting(false);
      }
    }
    
    submitResult();
  }, [category, practiceSetId, totalQuestions, correctAnswers, score, timeTaken, submitted]);
  
  const handleViewHistory = () => {
    router.push('/practice/history');
  };
  
  const handleTryAgain = () => {
    if (practiceSetId) {
      router.push(`/practice/sets/${practiceSetId}`);
    } else if (category) {
      router.push(`/practice?category=${category}`);
    } else {
      router.push('/practice');
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Practice Complete!</h2>
      
      <div className="mb-6">
        <div className="text-center mb-4">
          <span className="text-4xl font-bold">{score}%</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Questions</p>
            <p className="font-semibold">{totalQuestions}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Correct</p>
            <p className="font-semibold">{correctAnswers}</p>
          </div>
          {category && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-semibold">{category}</p>
            </div>
          )}
          {timeTaken && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-semibold">{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</p>
            </div>
          )}
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleTryAgain}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleViewHistory}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

