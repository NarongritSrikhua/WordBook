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
      setLoading(true);
      setError(null);
      
      const timestamp = new Date().getTime();
      const userId = user?.id || testUserId || null;
      
      if (!userId) {
        setError('User ID not available. Please log in to view your history.');
        setLoading(false);
        return;
      }
      
      const data = await getPracticeHistory(userId, forceRefresh, timestamp);
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
    if (isAuthenticated || testUserId) {
      fetchHistory(true); // Force refresh on initial load
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated, testUserId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add a refresh function
  const handleRefresh = () => {
    fetchHistory(true); // Force refresh on manual refresh
  };

  // Calculate stats
  const stats = history.length > 0 ? {
    totalSessions: history.length,
    averageScore: Math.round(history.reduce((sum, entry) => sum + entry.score, 0) / history.length),
    bestScore: Math.max(...history.map(entry => entry.score)),
    totalQuestions: history.reduce((sum, entry) => sum + entry.totalQuestions, 0),
    correctAnswers: history.reduce((sum, entry) => sum + entry.correctAnswers, 0),
  } : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Practice History</h1>
        <div className="flex items-center gap-4">
          {/* {lastFetched && (
            <span className="text-sm text-gray-500">
              Last updated: {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            disabled={loading}
          >
            <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button> */}
        </div>
      </div>
      
      {!isAuthenticated && !testUserId ? (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-8 rounded-xl shadow-md text-center border border-yellow-200">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-medium mb-4 text-gray-800">You need to be logged in to view your practice history.</p>
          <p className="text-gray-600 mb-6">Sign in to track your progress and see your improvement over time.</p>
          <Link href="/login" className="mt-4 inline-block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium">
            Log In
          </Link>
        </div>
      ) : loading && history.length === 0 ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your practice history...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-xl shadow-md mb-6 border border-red-200">
          <div className="flex items-center mb-2">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Error</span>
          </div>
          <p>{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-8 rounded-xl shadow-md text-center border border-gray-200">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-xl font-medium mb-4 text-gray-800">No practice history found.</p>
          <p className="text-gray-600 mb-6">Complete some practice sessions to see your history here.</p>
          <Link href="/practice" className="mt-4 inline-block bg-[#FF6B8B] text-white py-3 px-6 rounded-lg hover:bg-[#ff5277] transition-colors shadow-md hover:shadow-lg font-medium">
            Start Practicing
          </Link>
        </div>
      ) : (
        <div>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm font-medium">Total Sessions</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">All Time</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalSessions}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm font-medium">Average Score</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Performance</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.averageScore}%</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm font-medium">Best Score</h3>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Achievement</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.bestScore}%</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm font-medium">Correct Answers</h3>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Total</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.correctAnswers}/{stats.totalQuestions}</p>
              </div>
            </div>
          )}
          
          {/* History Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {loading && <div className="text-center py-2 text-gray-500 bg-blue-50">Refreshing data...</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(entry.completedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {entry.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                            entry.score >= 80 ? 'bg-green-500' : 
                            entry.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900">{entry.score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{entry.correctAnswers}</span>
                          <span className="mx-1">/</span>
                          <span>{entry.totalQuestions}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {entry.timeTaken ? 
                            `${Math.floor(entry.timeTaken / 60)}:${(entry.timeTaken % 60).toString().padStart(2, '0')}` : 
                            'N/A'
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


