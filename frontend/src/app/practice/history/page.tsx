'use client';

import { useState, useEffect } from 'react';
import { getPracticeHistory } from '@/app/lib/api/practice';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function PracticeHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [testUserId, setTestUserId] = useState<string | null>(null);

  // Initialize testUserId from localStorage after component mounts
  useEffect(() => {
    // Only access localStorage on the client side
    setTestUserId(localStorage.getItem('testUserId'));
  }, []);

  // Function to fetch history with forced refresh
  const fetchHistory = async (forceRefresh = false) => {
    try {
      console.log('Fetching practice history with forceRefresh:', forceRefresh);
      console.log('Current user:', user);
      setLoading(true);
      setError(null);
      
      // Add timestamp to force cache invalidation
      const timestamp = new Date().getTime();
      const userId = user?.id || testUserId || null;
      
      console.log('Using userId for history fetch:', userId);
      
      if (!userId) {
        console.warn('No user ID available for fetching history');
        setError('User ID not available. Please log in to view your history.');
        setLoading(false);
        return;
      }
      
      const data = await getPracticeHistory(userId, forceRefresh, timestamp);
      
      console.log('Fetched practice history:', data);
      setHistory(data);
      setLastFetched(new Date());
    } catch (err: any) {
      console.error('Error fetching practice history:', err);
      setError('Failed to load practice history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch history when the component mounts or user changes
  useEffect(() => {
    console.log('History page mounted or user changed, fetching data...');
    console.log('Current user:', user);
    
    if (isAuthenticated || testUserId) {
      fetchHistory(true); // Force refresh on initial load
    } else {
      console.log('User not authenticated, waiting...');
      setLoading(false);
    }
  }, [user, isAuthenticated, testUserId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Add a refresh function
  const handleRefresh = () => {
    console.log('Manually refreshing practice history...');
    fetchHistory(true); // Force refresh on manual refresh
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Practice History</h1>
        <div className="flex items-center gap-4">
          {lastFetched && (
            <span className="text-sm text-gray-500">
              Last updated: {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {!isAuthenticated && !testUserId ? (
        <div className="bg-yellow-100 p-6 rounded text-center">
          <p className="text-lg mb-4">You need to be logged in to view your practice history.</p>
          <Link href="/login" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
            Log In
          </Link>
        </div>
      ) : loading && history.length === 0 ? (
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
          {loading && <div className="text-center py-2 text-gray-500">Refreshing data...</div>}
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
    </div>
  );
}




