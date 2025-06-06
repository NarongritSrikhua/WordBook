'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getUsers, updateUser, deleteUser, setUserAdmin } from '@/app/lib/api/users';
import { User } from '@/app/lib/types';

export default function AdminUsersPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Auth check
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      console.log('Not authenticated, redirecting to login');
      router.replace('/login');
    } else if (!loading && isAuthenticated && user && user.role !== 'admin') {
      console.log('Not admin, redirecting to unauthorized');
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, user, loading, router]);

  // Load users
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      setPageLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setPageLoading(false);
    }
  };

  const handleEditUser = async (userData: Partial<User>) => {
    if (!editingUser) return;
    
    try {
      const updatedUser = await updateUser(editingUser.id, userData);
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const handleSetAdmin = async (id: string) => {
    try {
      const updatedUser = await setUserAdmin(id);
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
    } catch (err) {
      console.error('Error setting admin:', err);
      setError('Failed to set user as admin');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b8b]"></div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render anything (redirect will happen)
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b8b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b8b]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#ff6b8b] rounded-full flex items-center justify-center text-white">
                        {user.name[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleSetAdmin(user.id)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        Make Admin
                      </button>
                    )}
                    {/* <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black opacity-50" 
            onClick={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}
          ></div>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50 relative my-8 mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditUser({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={editingUser.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ff6b8b] focus:ring-[#ff6b8b]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    defaultValue={editingUser.email}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#ff6b8b] focus:ring-[#ff6b8b]"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff6b8b] text-white rounded-md hover:bg-[#ff5277]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}