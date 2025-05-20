'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFlashcards, createFlashcard, reviewFlashcard } from '../lib/api/flashcards';
import { useAuth } from '../context/AuthContext';

interface Flashcard {
    id: string;
    front: string;
    back: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    lastReviewed: Date | null;
    nextReview: Date | null;
}

const FlashcardsClient = () => {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [animation, setAnimation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [studyMode, setStudyMode] = useState<'all' | 'due'>('all');
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCard, setNewCard] = useState({
        front: '',
        back: '',
        category: ''
    });
    
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    
    // Check authentication and fetch flashcards
    useEffect(() => {
        const fetchCards = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedCards = await getFlashcards();
                setCards(fetchedCards);
            } catch (error) {
                console.error('Error fetching flashcards:', error);
                setError('Failed to load flashcards. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        // Fetch cards regardless of authentication status
        fetchCards();
    }, []);

    // CSS animations and styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
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
    
    // Check authentication status on page load
    useEffect(() => {
        // Just log authentication status for debugging
        const token = document.cookie.includes('auth_session') || document.cookie.includes('token');
        const localStorageToken = localStorage.getItem('token');
        
        console.log('Cookies available:', document.cookie);
        console.log('LocalStorage token available:', !!localStorageToken);
        console.log('User authenticated:', isAuthenticated);
    }, [isAuthenticated]);
    
    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Try Again
                </button>
            </div>
        );
    }
    
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
    
    const handleDifficultyRating = async (difficulty: 'easy' | 'medium' | 'hard') => {
        if (filteredCards.length === 0) return;
        
        try {
            const cardId = filteredCards[currentCardIndex].id;
            const isCorrect = difficulty !== 'hard'; // Assuming 'hard' means incorrect
            
            const updatedCard = await reviewFlashcard(cardId, isCorrect);
            
            const updatedCards = [...cards];
            const cardIndex = cards.findIndex(card => card.id === cardId);
            
            if (cardIndex !== -1) {
                updatedCards[cardIndex] = updatedCard;
                setCards(updatedCards);
            }
            
            handleNextCard();
        } catch (error) {
            console.error('Error updating card review:', error);
        }
    };
    
    const handleAddCard = async () => {
        if (newCard.front.trim() === '' || newCard.back.trim() === '') return;
        
        try {
            const createdCard = await createFlashcard({
                front: newCard.front,
                back: newCard.back,
                category: newCard.category,
                difficulty: 'medium'
            });
            
            setCards([...cards, createdCard]);
            
            setNewCard({
                front: '',
                back: '',
                category: ''
            });
            
            setShowAddCard(false);
        } catch (error) {
            console.error('Error adding card:', error);
        }
    };

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
                            Due Cards
                        </button>
                    </div>
                    
                    {/* Only show Add Card button for authenticated users */}
                    {isAuthenticated && (
                        <button 
                            onClick={() => setShowAddCard(true)}
                            className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-[#ff5c7f] transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Card
                        </button>
                    )}
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
                        
                        {/* Navigation Controls */}
                        <div className="flex justify-between items-center mb-6">
                            <button 
                                onClick={handlePrevCard}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Previous
                            </button>
                            
                            <button 
                                onClick={handleNextCard}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Difficulty Rating - only show for authenticated users */}
                        {isAuthenticated && (
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={() => handleDifficultyRating('easy')}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Easy
                                </button>
                                <button 
                                    onClick={() => handleDifficultyRating('medium')}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                    Medium
                                </button>
                                <button 
                                    onClick={() => handleDifficultyRating('hard')}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Hard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">No flashcards found</h2>
                    <p className="text-gray-600 mb-6">
                        {cards.length === 0 
                            ? isAuthenticated 
                                ? "You haven't created any flashcards yet." 
                                : "There are no flashcards available for this selection."
                            : "No cards match your current filters."}
                    </p>
                    {/* Only show create button for authenticated users */}
                    {isAuthenticated && (
                        <button 
                            onClick={() => setShowAddCard(true)}
                            className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-[#ff5c7f] transition-colors"
                        >
                            Create Your First Card
                        </button>
                    )}
                </div>
            )}
            
            {/* Add Card Modal */}
            {showAddCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Flashcard</h2>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Front (Question)
                            </label>
                            <textarea 
                                value={newCard.front}
                                onChange={(e) => setNewCard({...newCard, front: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B8B]"
                                rows={3}
                                placeholder="Enter the question or prompt"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Back (Answer)
                            </label>
                            <textarea 
                                value={newCard.back}
                                onChange={(e) => setNewCard({...newCard, back: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B8B]"
                                rows={3}
                                placeholder="Enter the answer"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Category
                            </label>
                            <input 
                                type="text" 
                                value={newCard.category}
                                onChange={(e) => setNewCard({...newCard, category: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B8B]"
                                placeholder="Enter the category (optional)"
                            />
                        </div>
                        
                        <div className="flex justify-end">
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


