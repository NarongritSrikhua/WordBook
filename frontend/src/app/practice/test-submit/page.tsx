'use client';

import { useState } from 'react';

export default function TestSubmitPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Submitting test practice result');
      
      const testData = {
        category: 'Test Category',
        totalQuestions: 10,
        correctAnswers: 8,
        score: 80,
        timeTaken: 120
      };
      
      const response = await fetch('/api/practice/submit-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Test practice result submitted successfully:', data);
      setResult(data);
    } catch (err) {
      console.error('Failed to submit test practice result:', err);
      setError('Failed to submit test practice result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Test Practice Result Submission</h1>
      
      <button
        onClick={handleSubmitTest}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      >
        {loading ? 'Submitting...' : 'Submit Test Practice Result'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <a href="/practice/history" className="text-blue-600 hover:underline">
          Go to Practice History
        </a>
      </div>
    </div>
  );
}