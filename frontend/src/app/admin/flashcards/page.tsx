'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/app/components/AdminProtectedRoute';
import { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '@/app/lib/api/flashcards';
import { getCategories } from '@/app/lib/api/categories';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  lastReviewed: Date | null;
  nextReview: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewCardForm {
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

export default function AdminFlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [newCard, setNewCard] = useState<{
    front: string;
    back: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    imageUrl: string;
  }>({
    front: '',
    back: '',
    category: '',
    difficulty: 'medium',
    imageUrl: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'updatedAt' | 'createdAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch flashcards with pagination
        const response = await getFlashcards({
          page: currentPage,
          limit: itemsPerPage,
          sortField,
          sortOrder
        });
        
        setCards(response.items);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
        
        // Fetch categories
        const fetchedCategories = await getCategories();
        const categoryNames = fetchedCategories.map(cat => cat.name);
        setCategories(categoryNames);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage, sortField, sortOrder]);
  
  const handleSort = (field: 'updatedAt' | 'createdAt') => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Filtered cards based on search and category
  const filteredCards = cards.filter(card => {
    const matchesSearch = searchTerm === '' || 
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) || 
      card.back.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || card.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddCard = async () => {
    if (newCard.front.trim() === '' || newCard.back.trim() === '') return;
    
    try {
      // Ensure category is not empty
      const categoryToUse = newCard.category.trim() === '' ? 'Uncategorized' : newCard.category;
      
      const flashcardData = {
        front: newCard.front,
        back: newCard.back,
        category: categoryToUse,
        difficulty: newCard.difficulty,
        imageUrl: newCard.imageUrl || undefined // Ensure imageUrl is included
      };
      
      console.log('Creating flashcard with data:', flashcardData);
      
      const createdCard = await createFlashcard(flashcardData);
      
      console.log('Created card:', createdCard);
      
      setCards([...cards, createdCard as Flashcard]);
      
      setNewCard({
        front: '',
        back: '',
        category: '',
        difficulty: 'medium',
        imageUrl: '' // Reset imageUrl
      });
      
      setShowAddCard(false);
    } catch (err) {
      console.error('Error adding card:', err);
      setError('Failed to add flashcard');
    }
  };
  
  const handleUpdateCard = async () => {
    if (!editingCard) return;
    
    try {
      // Ensure category is not empty
      const categoryToUse = editingCard.category.trim() === '' ? 'Uncategorized' : editingCard.category;
      
      // Make sure we're sending only the fields that should be updated
      const updateData = {
        front: editingCard.front,
        back: editingCard.back,
        category: categoryToUse,
        difficulty: editingCard.difficulty,
        imageUrl: editingCard.imageUrl || undefined // Use undefined instead of empty string
      };
      
      console.log('Sending update with data:', updateData);
      console.log('Flashcard ID:', editingCard.id);
      
      const updatedCard = await updateFlashcard(editingCard.id, updateData);
      console.log('Received updated card:', updatedCard);
      
      setCards(cards.map(card => 
        card.id === updatedCard.id ? updatedCard as Flashcard : card
      ));
      
      setShowEditCard(false);
      setEditingCard(null);
    } catch (err) {
      console.error('Error updating card:', err);
      setError('Failed to update flashcard');
    }
  };
  
  const handleDeleteClick = (card: Flashcard) => {
    setCardToDelete(card);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cardToDelete) return;
    
    try {
      console.log(`Attempting to delete flashcard with ID: ${cardToDelete.id}`);
      await deleteFlashcard(cardToDelete.id);
      console.log(`Successfully deleted flashcard with ID: ${cardToDelete.id}`);
      setCards(cards.filter(card => card.id !== cardToDelete.id));
      setShowDeleteConfirm(false);
      setCardToDelete(null);
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete flashcard');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setCardToDelete(null);
  };
  
  const handleEditClick = (card: Flashcard) => {
    setEditingCard(card);
    setShowEditCard(true);
  };
  
  if (loading) return <div className="text-center py-10">Loading flashcards...</div>;
  
  return (
    <AdminProtectedRoute>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Flashcard Management</h1>
          <button 
            onClick={() => setShowAddCard(true)}
            className="bg-[#ff6b8b] hover:bg-[#ff5277] text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Flashcard
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search flashcards..."
              className="w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full p-2 border rounded-md"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Front</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Back</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created At
                      {sortField === 'createdAt' && (
                        <span className="ml-1">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center">
                      Updated At
                      {sortField === 'updatedAt' && (
                        <span className="ml-1">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.map(card => (
                  <tr key={card.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.front}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.back}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${card.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                                card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                      {card.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.imageUrl ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                          <img 
                            src={card.imageUrl} 
                            alt="Thumbnail" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png';
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.createdAt ? new Date(card.createdAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.updatedAt ? new Date(card.updatedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditClick(card)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(card)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-[#ff6b8b] border-[#ff6b8b] text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Add Card Modal */}
        {showAddCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div 
              className="fixed inset-0 bg-black opacity-50" 
              onClick={() => setShowAddCard(false)}
            ></div>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50 relative my-8 mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Flashcard</h2>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Front</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    value={newCard.front}
                    onChange={(e) => setNewCard({...newCard, front: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Back</label>
                  <textarea
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    rows={3}
                    value={newCard.back}
                    onChange={(e) => setNewCard({...newCard, back: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    placeholder="https://example.com/image.jpg"
                    value={newCard.imageUrl || ''}
                    onChange={(e) => setNewCard({...newCard, imageUrl: e.target.value})}
                  />
                  {newCard.imageUrl && (
                    <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={newCard.imageUrl} 
                        alt="Preview" 
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                          e.currentTarget.alt = 'Invalid image URL';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    value={newCard.category}
                    onChange={(e) => setNewCard({...newCard, category: e.target.value})}
                  >
                    <option value="">Select a Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    value={newCard.difficulty}
                    onChange={(e) => setNewCard({...newCard, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCard}
                  className="px-4 py-2 bg-[#ff6b8b] hover:bg-[#ff5277] text-white rounded-md focus:outline-none"
                >
                  Add Flashcard
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Card Modal */}
        {showEditCard && editingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <div 
              className="fixed inset-0 bg-black opacity-50" 
              onClick={() => {
                setShowEditCard(false);
                setEditingCard(null);
              }}
            ></div>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50 relative my-8 mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Flashcard</h2>
                <button
                  onClick={() => {
                    setShowEditCard(false);
                    setEditingCard(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Front</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    value={editingCard.front}
                    onChange={(e) => setEditingCard({...editingCard, front: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Back</label>
                  <textarea
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    rows={3}
                    value={editingCard.back}
                    onChange={(e) => setEditingCard({...editingCard, back: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    placeholder="https://example.com/image.jpg"
                    value={editingCard.imageUrl || ''}
                    onChange={(e) => setEditingCard({...editingCard, imageUrl: e.target.value})}
                  />
                  {editingCard.imageUrl && (
                    <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={editingCard.imageUrl} 
                        alt="Preview" 
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                          e.currentTarget.alt = 'Invalid image URL';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    value={editingCard.category}
                    onChange={(e) => setEditingCard({...editingCard, category: e.target.value})}
                  >
                    <option value="">Select a Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-[#ff6b8b] focus:border-[#ff6b8b]"
                    value={editingCard.difficulty}
                    onChange={(e) => setEditingCard({...editingCard, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditCard(false);
                    setEditingCard(null);
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCard}
                  className="px-4 py-2 bg-[#ff6b8b] hover:bg-[#ff5277] text-white rounded-md focus:outline-none"
                >
                  Update Flashcard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && cardToDelete && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 shadow-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Delete Flashcard</h3>
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
                  Are you sure you want to delete this flashcard?
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Front:</p>
                  <p className="text-sm text-gray-600 mt-1">{cardToDelete.front}</p>
                  <p className="text-sm font-medium text-gray-900 mt-3">Back:</p>
                  <p className="text-sm text-gray-600 mt-1">{cardToDelete.back}</p>
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
                  Delete Flashcard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtectedRoute>
  );
}
