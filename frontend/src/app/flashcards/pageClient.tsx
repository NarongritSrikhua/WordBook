'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Flashcard {
    id: number;
    front: string;
    back: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    lastReviewed: Date | null;
    nextReview: Date | null;
}

const FlashcardsClient = () => {
    const [cards, setCards] = useState<Flashcard[]>([
        { id: 1, front: 'Hello', back: 'สสส', category: 'Greetings', difficulty: 'easy', lastReviewed: null, nextReview: null },
        { id: 2, front: 'Thank you', back: 'ขอบคุณ', category: 'Greetings', difficulty: 'easy', lastReviewed: null, nextReview: null },
        { id: 3, front: 'Goodbye', back: 'ลาก่อน', category: 'Greetings', difficulty: 'easy', lastReviewed: null, nextReview: null },
        { id: 4, front: 'How are you?', back: 'สบายไหม', category: 'Greetings', difficulty: 'medium', lastReviewed: null, nextReview: null },
        { id: 5, front: 'I don\'t understand', back: 'ไม่เข้าใจ', category: 'Common Phrases', difficulty: 'medium', lastReviewed: null, nextReview: null },
        { id: 6, front: 'Water', back: 'น้ำ', category: 'Food & Drink', difficulty: 'easy', lastReviewed: null, nextReview: null },
    ]);
    
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [studyMode, setStudyMode] = useState<'all' | 'due'>('all');
    const [animation, setAnimation] = useState('');
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCard, setNewCard] = useState<{front: string, back: string, category: string}>({
        front: '',
        back: '',
        category: ''
    });
    
    const categories = Array.from(new Set(cards.map(card => card.category)));
    
    const filteredCards = cards.filter(card => 
        (selectedCategory === null || card.category === selectedCategory) &&
        (studyMode === 'all' || (card.nextReview !== null && new Date(card.nextReview) <= new Date()))
    );
    
    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };
    
    const handleNextCard = () => {
        if (filteredCards.length === 0) return;
        
        setAnimation('slide-out-right');
        setTimeout(() => {
            setIsFlipped(false);
            setCurrentCardIndex((currentCardIndex + 1) % filteredCards.length);
            setAnimation('slide-in-left');
        }, 300);
        
        setTimeout(() => {
            setAnimation('');
        }, 600);
    };
    
    const handlePrevCard = () => {
        if (filteredCards.length === 0) return;
        
        setAnimation('slide-out-left');
        setTimeout(() => {
            setIsFlipped(false);
            setCurrentCardIndex((currentCardIndex - 1 + filteredCards.length) % filteredCards.length);
            setAnimation('slide-in-right');
        }, 300);
        
        setTimeout(() => {
            setAnimation('');
        }, 600);
    };
    
    const handleDifficultyRating = (difficulty: 'easy' | 'medium' | 'hard') => {
        if (filteredCards.length === 0) return;
        
        const now = new Date();
        let nextReviewDate = new Date();
        
        // Simple spaced repetition algorithm
        switch(difficulty) {
            case 'easy':
                nextReviewDate.setDate(now.getDate() + 7); // Review in 7 days
                break;
            case 'medium':
                nextReviewDate.setDate(now.getDate() + 3); // Review in 3 days
                break;
            case 'hard':
                nextReviewDate.setDate(now.getDate() + 1); // Review tomorrow
                break;
        }
        
        const updatedCards = [...cards];
        const cardIndex = cards.findIndex(card => card.id === filteredCards[currentCardIndex].id);
        
        updatedCards[cardIndex] = {
            ...updatedCards[cardIndex],
            lastReviewed: now,
            nextReview: nextReviewDate
        };
        
        setCards(updatedCards);
        handleNextCard();
    };
    
    const handleAddCard = () => {
        if (newCard.front.trim() === '' || newCard.back.trim() === '') return;
        
        const newId = cards.length > 0 ? Math.max(...cards.map(card => card.id)) + 1 : 1;
        
        setCards([...cards, {
            id: newId,
            front: newCard.front,
            back: newCard.back,
            category: newCard.category || 'Uncategorized',
            difficulty: 'medium',
            lastReviewed: null,
            nextReview: null
        }]);
        
        setNewCard({
            front: '',
            back: '',
            category: ''
        });
        
        setShowAddCard(false);
    };
    
    // Add CSS for animations
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(50px); opacity: 0; }
            }
            
            @keyframes slideOutLeft {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-50px); opacity: 0; }
            }
            
            @keyframes slideInLeft {
                from { transform: translateX(50px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(-50px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .slide-out-right {
                animation: slideOutRight 0.3s forwards;
            }
            
            .slide-out-left {
                animation: slideOutLeft 0.3s forwards;
            }
            
            .slide-in-left {
                animation: slideInLeft 0.3s forwards;
            }
            
            .slide-in-right {
                animation: slideInRight 0.3s forwards;
            }
            
            .flip-card {
                perspective: 1000px;
            }
            
            .flip-card-inner {
                transition: transform 0.6s;
                transform-style: preserve-3d;
            }
            
            .flip-card-flipped .flip-card-inner {
                transform: rotateY(180deg);
            }
            
            .flip-card-front, .flip-card-back {
                backface-visibility: hidden;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            .flip-card-back {
                transform: rotateY(180deg);
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    const router = useRouter();

    useEffect(() => {
        // Check authentication status on page load
        const token = document.cookie.includes('auth_session') || document.cookie.includes('token');
        const localStorageToken = localStorage.getItem('token');
        
        console.log('Cookies available:', document.cookie);
        console.log('LocalStorage token available:', !!localStorageToken);
        
        // If no authentication, redirect to login
        if (!token && !localStorageToken) {
            console.log('No authentication found, redirecting to login');
            router.push('/login?callbackUrl=/flashcards');
        }
    }, [router]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Flashcards</h1>
                <div className="flex flex-wrap gap-4 mb-4">
                    <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full ${selectedCategory === null ? 'bg-[#FF6B8B] text-white' : 'bg-gray-100 text-gray-700'} transition-colors`}
                    >
                        All Categories
                    </button>
                    {categories.map(category => (
                        <button 
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full ${selectedCategory === category ? 'bg-[#FF6B8B] text-white' : 'bg-gray-100 text-gray-700'} transition-colors`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setStudyMode('all')}
                            className={`px-4 py-2 rounded-lg ${studyMode === 'all' ? 'bg-[#FF6B8B] text-white' : 'bg-gray-100 text-gray-700'} transition-colors`}
                        >
                            All Cards
                        </button>
                        <button 
                            onClick={() => setStudyMode('due')}
                            className={`px-4 py-2 rounded-lg ${studyMode === 'due' ? 'bg-[#FF6B8B] text-white' : 'bg-gray-100 text-gray-700'} transition-colors`}
                        >
                            Due for Review
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setShowAddCard(true)}
                        className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-[#ff5c7f] transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Card
                    </button>
                </div>
            </div>
            
            {/* Flashcard Display */}
            {filteredCards.length > 0 ? (
                <div className="mb-8">
                    <div className="max-w-md mx-auto">
                        {/* Card Counter */}
                        <div className="text-center mb-4 text-gray-600">
                            Card {currentCardIndex + 1} of {filteredCards.length}
                        </div>
                        
                        {/* Flashcard */}
                        <div 
                            className={`flip-card h-64 mb-6 ${isFlipped ? 'flip-card-flipped' : ''}`}
                            onClick={handleCardClick}
                        >
                            <div className={`flip-card-inner w-full h-full ${animation}`}>
                                <div className="flip-card-front bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
                                    <div className="text-sm text-gray-500 mb-2">{filteredCards[currentCardIndex].category}</div>
                                    <div className="text-2xl font-bold text-center text-gray-800">{filteredCards[currentCardIndex].front}</div>
                                    <div className="mt-4 text-sm text-gray-500">Click to flip</div>
                                </div>
                                <div className="flip-card-back bg-[#FF6B8B] text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
                                    <div className="text-2xl font-bold text-center">{filteredCards[currentCardIndex].back}</div>
                                    <div className="mt-4 text-sm">Click to flip back</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-between mb-8">
                            <button 
                                onClick={handlePrevCard}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Previous
                            </button>
                            <button 
                                onClick={handleNextCard}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center"
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Difficulty Rating */}
                        <div className="text-center mb-2">
                            <p className="text-gray-600 mb-2">How well did you know this?</p>
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={() => handleDifficultyRating('hard')}
                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Hard
                                </button>
                                <button 
                                    onClick={() => handleDifficultyRating('medium')}
                                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Medium
                                </button>
                                <button 
                                    onClick={() => handleDifficultyRating('easy')}
                                    className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Easy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No cards to study</h3>
                    <p className="text-gray-600 mb-6">
                        {selectedCategory ? `No cards found in the "${selectedCategory}" category.` : 
                         studyMode === 'due' ? "No cards are due for review." : "No cards available."}
                    </p>
                    <button 
                        onClick={() => setShowAddCard(true)}
                        className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-[#ff5c7f] transition-colors inline-flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Card
                    </button>
                </div>
            )}
            
            {/* Add Card Modal */}
            {showAddCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Add New Card</h2>
                            <button 
                                onClick={() => setShowAddCard(false)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                />
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
        </div>
    );
};

export default FlashcardsClient;


