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
  lastReviewed: Date | null;
  nextReview: Date | null;
}

interface NewCardForm {
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function AdminFlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [newCard, setNewCard] = useState<NewCardForm>({
    front: '',
    back: '',
    category: '',
    difficulty: 'medium'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch flashcards
        const fetchedCards = await getFlashcards();
        setCards(fetchedCards as Flashcard[]);
        
        // Fetch categories
        const fetchedCategories = await getCategories();
        // Extract category names from the response
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
  }, []);
  
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
      
      const createdCard = await createFlashcard({
        front: newCard.front,
        back: newCard.back,
        category: categoryToUse,
        difficulty: newCard.difficulty
      });
      
      console.log('Created card:', createdCard);
      
      setCards([...cards, createdCard as Flashcard]);
      
      setNewCard({
        front: '',
        back: '',
        category: '',
        difficulty: 'medium'
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
        difficulty: editingCard.difficulty
      };
      
      console.log('Sending update with data:', updateData);
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
  
  const handleDeleteCard = async (id: string) => {
    try {
      await deleteFlashcard(id);
      setCards(cards.filter(card => card.id !== id));
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete flashcard');
    }
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
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Front</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Back</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.map(card => (
                  <tr key={card.id}>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.id}</td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.front}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.back}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{card.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${card.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                          card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {card.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-red-600 hover:text-red-900 mr-4"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleEditClick(card)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </div>
    </AdminProtectedRoute>
  );
}
