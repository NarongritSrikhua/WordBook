'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/lib/api/categories';

interface Category {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AdminCategoriesPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editedName, setEditedName] = useState('');

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

  // Load categories
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchCategories();
    }
  }, [isAuthenticated, user]);

  const fetchCategories = async () => {
    try {
      setPageLoading(true);
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setPageLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') return;
    
    try {
      const createdCategory = await createCategory(newCategoryName);
      setCategories([...categories, createdCategory]);
      setNewCategoryName('');
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || editedName.trim() === '') return;
    
    try {
      const updatedCategory = await updateCategory(editingCategory.id, editedName);
      setCategories(categories.map(category => 
        category.id === updatedCategory.id ? updatedCategory : category
      ));
      setEditingCategory(null);
      setEditedName('');
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(category => category.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditedName(category.name);
  };

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
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <div className="flex">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Enter category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            className="bg-[#ff6b8b] hover:bg-[#ff5277] text-white px-4 py-2 rounded-r-md"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCategory?.id === category.id ? (
                      <input
                        type="text"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-300"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory()}
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingCategory?.id === category.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleUpdateCategory}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null);
                            setEditedName('');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
