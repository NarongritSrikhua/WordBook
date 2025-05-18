'use client';

import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/app/components/AdminProtectedRoute';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date | null;
  nextReview: Date | null;
}

export default function AdminFlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([
    { id: 1, front: 'Hello', back: 'ส<|im_start|>ส3', category: 'Greetings', difficulty: 'easy', lastReviewed: null, nextReview: null },
    { id: 2, front: 'Thank you', back: 'ขอบ3', category: 'Greetings', difficulty: 'easy', lastReviewed: null, nextReview: null },
    { id: 3, front: 'Goodbye', back: 'ลาก่อน', category: 'Greetings', difficulty: 'easy', lastReviewed: null, nextReview: null },
  ]);
  
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [newCard, setNewCard] = useState<{
    front: string;
    back: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>({
    front: '',
    back: '',
    category: '',
    difficulty: 'medium'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(cards.map(card => card.category)));
  
  // Filtered cards based on search and category
  const filteredCards = cards.filter(card => {
    const matchesSearch = searchTerm === '' || 
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) || 
      card.back.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || card.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleAddCard = () => {
    if (newCard.front.trim() === '' || newCard.back.trim() === '') return;
    
    const newId = cards.length > 0 ? Math.max(...cards.map(card => card.id)) + 1 : 1;
    
    setCards([...cards, {
      id: newId,
      front: newCard.front,
      back: newCard.back,
      category: newCard.category || 'Uncategorized',
      difficulty: newCard.difficulty,
      lastReviewed: null,
      nextReview: null
    }]);
    
    setNewCard({
      front: '',
      back: '',
      category: '',
      difficulty: 'medium'
    });
    
    setShowAddCard(false);
  };
  
  const handleDeleteCard = (id: number) => {
    setCards(cards.filter(card => card.id !== id));
  };
  
  const handleEditClick = (card: Flashcard) => {
    setEditingCard(card);
    setShowEditCard(true);
  };
  
  const handleUpdateCard = () => {
    if (!editingCard) return;
    if (editingCard.front.trim() === '' || editingCard.back.trim() === '') return;
    
    setCards(cards.map(card => 
      card.id === editingCard.id ? editingCard : card
    ));
    
    setShowEditCard(false);
    setEditingCard(null);
  };
  
  return (
    <AdminProtectedRoute>
      <div className="max-w-6xl mx-auto">
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
        
        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff6b8b] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Flashcards Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.id}</td>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Flashcard</h2>
                <button 
                  onClick={() => setShowAddCard(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="front" className="block text-sm font-medium text-gray-700">Front</label>
                  <input 
                    type="text" 
                    id="front" 
                    value={newCard.front}
                    onChange={(e) => setNewCard({...newCard, front: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="English word or phrase"
                  />
                </div>
                <div>
                  <label htmlFor="back" className="block text-sm font-medium text-gray-700">Back</label>
                  <input 
                    type="text" 
                    id="back" 
                    value={newCard.back}
                    onChange={(e) => setNewCard({...newCard, back: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Translation"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <input 
                    type="text" 
                    id="category" 
                    value={newCard.category}
                    onChange={(e) => setNewCard({...newCard, category: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="e.g. Greetings, Food, Travel"
                  />
                </div>
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <select 
                    id="difficulty" 
                    value={newCard.difficulty}
                    onChange={(e) => setNewCard({...newCard, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleAddCard}
                  className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-[#ff5c7f] transition-colors"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Card Modal */}
        {showEditCard && editingCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Flashcard</h2>
                <button 
                  onClick={() => setShowEditCard(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-front" className="block text-sm font-medium text-gray-700">Front</label>
                  <input 
                    type="text" 
                    id="edit-front" 
                    value={editingCard.front}
                    onChange={(e) => setEditingCard({...editingCard, front: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="English word or phrase"
                  />
                </div>
                <div>
                  <label htmlFor="edit-back" className="block text-sm font-medium text-gray-700">Back</label>
                  <input 
                    type="text" 
                    id="edit-back" 
                    value={editingCard.back}
                    onChange={(e) => setEditingCard({...editingCard, back: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Translation"
                  />
                </div>
                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
                  <input 
                    type="text" 
                    id="edit-category" 
                    value={editingCard.category}
                    onChange={(e) => setEditingCard({...editingCard, category: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Category"
                  />
                </div>
                <div>
                  <label htmlFor="edit-difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <select 
                    id="edit-difficulty" 
                    value={editingCard.difficulty}
                    onChange={(e) => setEditingCard({...editingCard, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleUpdateCard}
                  className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-[#ff5c7f] transition-colors"
                >
                  Update Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtectedRoute>
  );
}
