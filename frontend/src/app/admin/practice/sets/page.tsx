'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { 
  getPracticeSets, 
  deletePracticeSet,
  PracticeSet
} from '@/app/lib/api/practice';

export default function PracticeSetsPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [setToDelete, setSetToDelete] = useState<PracticeSet | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (isAuthenticated) {
      fetchPracticeSets();
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const sortedSets = [...practiceSets].sort((a, b) => {
      const aDate = new Date(a[sortField]).getTime();
      const bDate = new Date(b[sortField]).getTime();
      return sortOrder === 'ASC' ? aDate - bDate : bDate - aDate;
    });
    setPracticeSets(sortedSets);
  }, [sortField, sortOrder]);

  const fetchPracticeSets = async () => {
    try {
      setPageLoading(true);
      const data = await getPracticeSets();
      setPracticeSets(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching practice sets:', err);
      setError('Failed to load practice sets');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSort = (field: 'createdAt' | 'updatedAt') => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('DESC');
    }
  };

  const handleDeleteClick = (practiceSet: PracticeSet) => {
    setSetToDelete(practiceSet);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!setToDelete) return;
    
    try {
      await deletePracticeSet(setToDelete.id);
      setPracticeSets(practiceSets.filter(set => set.id !== setToDelete.id));
      setShowDeleteConfirm(false);
      setSetToDelete(null);
    } catch (err) {
      console.error('Error deleting practice set:', err);
      setError('Failed to delete practice set');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSetToDelete(null);
  };

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
        <h1 className="text-3xl font-bold">Practice Sets</h1>
        <div className="flex space-x-4">
          <Link 
            href="/admin/practice"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Manage Questions
          </Link>
          <Link 
            href="/admin/practice/create"
            className="bg-[#ff6b8b] hover:bg-[#ff5277] text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Set
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {pageLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b8b]"></div>
        </div>
      ) : practiceSets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No practice sets found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  Created At
                  {sortField === 'createdAt' && (
                    <span className="ml-1">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('updatedAt')}
                >
                  Updated At
                  {sortField === 'updatedAt' && (
                    <span className="ml-1">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {practiceSets.map((set) => (
                <tr key={set.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{set.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${set.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                        set.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        set.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {set.difficulty ? set.difficulty.charAt(0).toUpperCase() + set.difficulty.slice(1) : 'Medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {set.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${set.type === 'text' ? 'bg-indigo-100 text-indigo-800' : 
                        set.type === 'image' ? 'bg-purple-100 text-purple-800' : 
                        set.type === 'fill' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {set.type ? set.type.charAt(0).toUpperCase() + set.type.slice(1) : 'Mixed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{set.questionIds?.length || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(set.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(set.updatedAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        href={`/admin/practice/sets/${set.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/practice/sets/${set.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(set)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && setToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Delete Practice Set</h3>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <p className="text-center text-gray-600">
                Are you sure you want to delete this practice set?
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Name:</p>
                <p className="text-sm text-gray-600 mt-1">{setToDelete.name}</p>
                <p className="text-sm font-medium text-gray-900 mt-3">Description:</p>
                <p className="text-sm text-gray-600 mt-1">{setToDelete.description}</p>
                <p className="text-sm font-medium text-gray-900 mt-3">Questions:</p>
                <p className="text-sm text-gray-600 mt-1">{setToDelete.questionIds.length} questions</p>
                <p className="text-sm font-medium text-gray-900 mt-3">Difficulty:</p>
                <p className="text-sm text-gray-600 mt-1">{setToDelete.difficulty}</p>
                <p className="text-sm font-medium text-gray-900 mt-3">Category:</p>
                <p className="text-sm text-gray-600 mt-1">{setToDelete.category || 'Uncategorized'}</p>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Delete Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}