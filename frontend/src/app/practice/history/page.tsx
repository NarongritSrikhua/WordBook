'use client';

import { useState, useEffect } from 'react';
import { getPracticeHistory } from '@/app/lib/api/practice';
import Link from 'next/link';

export default function PracticeHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const data = await getPracticeHistory();
        setHistory(data);
      } catch (err) {
        console.error('Error fetching practice history:', err);
        setError('Failed to load practice history. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Practice History</h1>
      
      <Link href="/practice" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Practice
      </Link>
      
      {loading ? (
        <div className="text-center py-8">Loading history...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      ) : history.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded text-center">
          <p className="text-lg mb-4">No practice history found.</p>
          <p>Complete some practice sessions to see your history here.</p>
          <Link href="/practice" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
            Start Practicing
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Score</th>
                <th className="py-3 px-4 text-left">Questions</th>
                <th className="py-3 px-4 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="py-3 px-4">{formatDate(entry.completedAt)}</td>
                  <td className="py-3 px-4">{entry.category || 'General'}</td>
                  <td className="py-3 px-4">{entry.score}%</td>
                  <td className="py-3 px-4">{entry.correctAnswers}/{entry.totalQuestions}</td>
                  <td className="py-3 px-4">
                    {entry.timeTaken ? `${Math.floor(entry.timeTaken / 60)}:${(entry.timeTaken % 60).toString().padStart(2, '0')}` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8">
        <Link href="/practice/test-submit" className="text-blue-600 hover:underline">
          Test Submission
        </Link>
      </div>
    </div>
  );
}

