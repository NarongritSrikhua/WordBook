'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getRandomPracticeQuestions,
  getPracticeQuestions,
  getPracticeSets,
  getPracticeSet,
  getCategories,
  PracticeQuestion,
  PracticeSet
} from '@/app/lib/api/practice';
import Image from 'next/image';

export default function PracticeClient() {
    // Rename the state variables to avoid any potential conflicts
    const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<PracticeQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isCorrectFill, setIsCorrectFill] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [timer, setTimer] = useState(30);
    const [timerActive, setTimerActive] = useState(true);
    const [questionType, setQuestionType] = useState<'all' | 'text' | 'image' | 'fill'>('all');
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    
    // State for practice sets
    const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
    const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
    const [showSetSelection, setShowSetSelection] = useState(true);

    // State for categories
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categoriesError, setCategoriesError] = useState<boolean>(false);

    // Fetch practice sets on component mount
    useEffect(() => {
        const fetchPracticeSets = async () => {
            try {
                setLoading(true);
                const data = await getPracticeSets();
                console.log('Fetched practice sets:', data);
                setPracticeSets(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching practice sets:', err);
                setError('Failed to load practice sets. Please try again later.');
                setLoading(false);
            }
        };

        fetchPracticeSets();
    }, []);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log('Fetching practice categories');
                setCategoriesError(false);
                const data = await getCategories();
                console.log('Fetched categories:', data);
                
                if (Array.isArray(data) && data.length > 0) {
                    setCategories(data);
                } else {
                    // If we got an empty array or non-array, use default categories
                    console.warn('No categories returned, using defaults');
                    setCategories(['General Knowledge', 'Mathematics', 'Science', 'History', 'Geography', 'Language']);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategoriesError(true);
                // Set default categories to avoid breaking the UI
                setCategories(['General Knowledge', 'Mathematics', 'Science', 'History', 'Geography', 'Language']);
            }
        };
        
        fetchCategories();
    }, []);

    // Fetch questions when a practice set is selected
    const handleSetSelection = async (setId: string) => {
        try {
            console.log('Selecting practice set:', setId);
            setLoading(true);
            const practiceSet = await getPracticeSet(setId, true);
            console.log('Fetched practice set:', practiceSet);
            
            if (practiceSet.questions && practiceSet.questions.length > 0) {
                console.log('Using questions from practice set response');
                setPracticeQuestions(practiceSet.questions);
                setFilteredQuestions(practiceSet.questions);
            } else if (practiceSet.questionIds && practiceSet.questionIds.length > 0) {
                // If questions aren't included in the response, fetch all questions and filter
                console.log('Fetching all questions and filtering');
                const allQuestions = await getPracticeQuestions();
                const setQuestions = allQuestions.filter(q => 
                    practiceSet.questionIds.includes(q.id)
                );
                console.log('Filtered questions:', setQuestions);
                setPracticeQuestions(setQuestions);
                setFilteredQuestions(setQuestions);
            } else {
                console.log('No questions found in practice set');
                setError('This practice set has no questions.');
            }
            
            setSelectedSetId(setId);
            setShowSetSelection(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setUserInput('');
            setIsCorrectFill(null);
            setScore(0);
            setStreak(0);
            setShowResults(false);
            setTimer(30);
            setTimerActive(true);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching practice set questions:', err);
            setError('Failed to load practice questions. Please try again later.');
            setLoading(false);
        }
    };

    // Start random practice (existing functionality)
    const startRandomPractice = async (category?: string) => {
        try {
            console.log('Starting random practice', category ? `for category: ${category}` : 'for all categories');
            setLoading(true);
            
            // Pass the category to the API call if provided
            const data = await getRandomPracticeQuestions(10, category);
            console.log('Fetched random questions:', data);
            
            // Double-check category filtering on the client side
            let filteredData = data;
            if (category && Array.isArray(data)) {
                console.log(`Filtering questions by category: ${category}`);
                filteredData = data.filter(q => q.category === category);
                console.log(`After filtering: ${filteredData.length} questions remain`);
                
                // If we have too few questions after filtering, show a warning
                if (filteredData.length < 5) {
                    console.warn(`Very few questions (${filteredData.length}) available for category: ${category}`);
                    // You could show a warning to the user here
                }
            }
            
            setPracticeQuestions(filteredData);
            setFilteredQuestions(filteredData);
            setSelectedCategory(category || null);
            setSelectedSetId(null);
            setShowSetSelection(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setUserInput('');
            setIsCorrectFill(null);
            setScore(0);
            setStreak(0);
            setShowResults(false);
            setTimer(30);
            setTimerActive(true);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching random practice questions:', err);
            setError('Failed to load practice questions. Please try again later.');
            setLoading(false);
        }
    };

    // Return to set selection
    const backToSetSelection = () => {
        setShowSetSelection(true);
        setShowResults(false);
    };

    // Filter questions based on selected type
    useEffect(() => {
        if (questionType === 'all') {
            setFilteredQuestions(practiceQuestions);
        } else {
            setFilteredQuestions(practiceQuestions.filter(q => q.type === questionType));
        }
        // Reset to first question when filter changes
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setUserInput('');
        setIsCorrectFill(null);
    }, [questionType, practiceQuestions]);

    // Timer effect
    useEffect(() => {
        if (timerActive && timer > 0) {
            timerRef.current = setTimeout(() => {
                setTimer(timer - 1);
            }, 1000);
        } else if (timer === 0) {
            // Time's up, move to next question
            handleNextQuestion();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timer, timerActive]);

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setTimerActive(false); // Pause timer when answer is selected
        
        const isCorrect = answer === filteredQuestions[currentQuestionIndex].translation;
        
        if (isCorrect) {
            setScore(score + 1);
            setStreak(streak + 1);
        } else {
            setStreak(0); // Reset streak on wrong answer
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < filteredQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setUserInput('');
            setIsCorrectFill(null);
            setTimer(30);
            setTimerActive(true);
        } else {
            // End of questions, show results
            setShowResults(true);
        }
    };

    const handleFillSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (userInput.trim() === '') return;
        
        setTimerActive(false); // Pause timer when answer is submitted
        
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        const isCorrect = userInput.toLowerCase().trim() === currentQuestion.answer?.toLowerCase();
        setIsCorrectFill(isCorrect);
        
        if (isCorrect) {
            setScore(score + 1);
            setStreak(streak + 1);
        } else {
            setStreak(0); // Reset streak on wrong answer
        }
    };

    const restartPractice = async () => {
        try {
            setLoading(true);
            const data = await getRandomPracticeQuestions(10);
            setPracticeQuestions(data);
            setFilteredQuestions(questionType === 'all' ? data : data.filter(q => q.type === questionType));
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setUserInput('');
            setIsCorrectFill(null);
            setScore(0);
            setStreak(0);
            setShowResults(false);
            setTimer(30);
            setTimerActive(true);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching practice questions:', err);
            setError('Failed to load practice questions. Please try again later.');
            setLoading(false);
        }
    };

    // Modify the loading state to show a loading spinner
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B8B]"></div>
            </div>
        );
    }

    // Modify the error state to show an error message
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                        <p className="text-gray-700 mb-6">{error}</p>
                        <button 
                            onClick={() => router.push('/')}
                            className="bg-[#FF6B8B] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Add a new component for practice set selection
    if (showSetSelection) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Choose a Practice Set</h1>
                    
                    {/* Random Practice Options */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Random Practice</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* All Categories Option */}
                            <div 
                                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-[#FF6B8B]"
                                onClick={() => startRandomPractice()}
                            >
                                <div className="p-4">
                                    <h3 className="text-lg font-bold mb-2 text-[#FF6B8B]">All Categories</h3>
                                    <p className="text-gray-600 mb-3 text-sm">Practice with random questions from all categories.</p>
                                    <div className="flex justify-end">
                                        <button className="bg-[#FF6B8B] text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition-colors text-sm">
                                            Start
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Category-specific options */}
                            {categories && categories.length > 0 ? (
                                categories.map(category => (
                                    <div 
                                        key={category}
                                        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-[#FF6B8B]"
                                        onClick={() => startRandomPractice(category)}
                                    >
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold mb-2 text-gray-800">{category}</h3>
                                            <p className="text-gray-600 mb-3 text-sm">Practice with random questions from this category.</p>
                                            <div className="flex justify-end">
                                                <button className="bg-[#FF6B8B] text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition-colors text-sm">
                                                    Start
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg p-4">
                                    <p className="text-gray-600">No categories available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Practice Sets */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Practice Sets</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {practiceSets.map(set => (
                                <div 
                                    key={set.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-[#FF6B8B]"
                                    onClick={() => handleSetSelection(set.id)}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-xl font-bold text-gray-800">{set.name}</h2>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                set.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                set.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {set.difficulty?.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-4">{set.description || 'No description available.'}</p>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-sm text-gray-500">
                                                    {set.questionIds?.length || 0} questions
                                                </span>
                                                {set.category && (
                                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                                        {set.category}
                                                    </span>
                                                )}
                                                {set.type && set.type !== 'mixed' && (
                                                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                                        {set.type}
                                                    </span>
                                                )}
                                            </div>
                                            <button className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                                                Practice
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (filteredQuestions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h2>
                        <p className="text-gray-700 mb-6">There are no practice questions available for the selected type.</p>
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={() => setQuestionType('all')}
                                className="bg-[#FF6B8B] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                            >
                                Show All Questions
                            </button>
                            <button 
                                onClick={() => router.push('/')}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Modify the results screen to include a "Practice Another Set" button
    if (showResults) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-center mb-6">Practice Results</h2>
                        <div className="bg-[#FADADD] rounded-lg p-6 mb-6">
                            <div className="text-center">
                                <p className="text-gray-700 mb-2">Your Score</p>
                                <p className="text-4xl font-bold text-[#FF6B8B]">{score} / {filteredQuestions.length}</p>
                                <p className="text-gray-600 mt-2">
                                    {score === filteredQuestions.length 
                                        ? 'Perfect! Amazing job!' 
                                        : score >= filteredQuestions.length * 0.7 
                                            ? 'Great job!' 
                                            : 'Keep practicing!'}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={selectedSetId ? () => handleSetSelection(selectedSetId) : startRandomPractice}
                                className="bg-[#FF6B8B] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                            >
                                Practice Again
                            </button>
                            <button 
                                onClick={backToSetSelection}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Choose Another Set
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = filteredQuestions[currentQuestionIndex];

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    {/* Header with progress and stats */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 font-medium">Question {currentQuestionIndex + 1} of {filteredQuestions.length}</span>
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-2">Score:</span>
                                <span className="bg-[#FADADD] text-[#FF6B8B] px-2 py-1 rounded-md font-bold">{score}</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-[#FF6B8B] h-2.5 rounded-full" 
                                style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Filter buttons */}
                    {/* <div className="flex justify-center mb-6 space-x-2">
                        <button 
                            onClick={() => setQuestionType('all')}
                            className={`px-3 py-1 rounded-full text-sm ${questionType === 'all' ? 'bg-[#FF6B8B] text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setQuestionType('text')}
                            className={`px-3 py-1 rounded-full text-sm ${questionType === 'text' ? 'bg-[#FF6B8B] text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Text
                        </button>
                        <button 
                            onClick={() => setQuestionType('image')}
                            className={`px-3 py-1 rounded-full text-sm ${questionType === 'image' ? 'bg-[#FF6B8B] text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Image
                        </button>
                        <button 
                            onClick={() => setQuestionType('fill')}
                            className={`px-3 py-1 rounded-full text-sm ${questionType === 'fill' ? 'bg-[#FF6B8B] text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Fill
                        </button>
                    </div> */}

                    {/* Timer */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Time remaining</span>
                            <span className={`text-sm font-medium ${timer <= 5 ? 'text-red-500' : 'text-gray-700'}`}>{timer}s</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full ${timer <= 5 ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${(timer / 30) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question content */}
                    <div className="mb-8">
                        {currentQuestion.type === 'text' && (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2 text-gray-800">{currentQuestion.word}</h2>
                                <p className="text-gray-600 mb-4">What is the translation?</p>
                            </div>
                        )}

                        {currentQuestion.type === 'image' && (
                            <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    {currentQuestion.imageUrl && (
                                        <div className="relative w-48 h-48">
                                            <Image 
                                                src={currentQuestion.imageUrl} 
                                                alt="Question image" 
                                                fill
                                                style={{ objectFit: 'contain' }}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-4">What is this called?</p>
                            </div>
                        )}

                        {currentQuestion.type === 'fill' && (
                            <div className="text-center">
                                <h2 className="text-xl font-medium mb-4 text-gray-800">{currentQuestion.fillPrompt}</h2>
                                <form onSubmit={handleFillSubmit} className="mb-4">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        disabled={isCorrectFill !== null}
                                        placeholder="Type your answer..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B8B] focus:border-transparent"
                                    />
                                    {isCorrectFill === null && (
                                        <button
                                            type="submit"
                                            className="mt-4 w-full bg-[#FF6B8B] text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                                        >
                                            Submit
                                        </button>
                                    )}
                                </form>
                                {isCorrectFill !== null && (
                                    <div className={`p-3 rounded-lg mb-4 ${isCorrectFill ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {isCorrectFill ? (
                                            <p>Correct! Well done!</p>
                                        ) : (
                                            <p>Incorrect. The correct answer is: <strong>{currentQuestion.answer}</strong></p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Multiple choice options for text and image questions */}
                        {(currentQuestion.type === 'text' || currentQuestion.type === 'image') && currentQuestion.options && (
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(option)}
                                        disabled={selectedAnswer !== null}
                                        className={`w-full py-3 px-4 rounded-lg text-left transition-colors ${
                                            selectedAnswer === option
                                                ? option === currentQuestion.translation
                                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                                    : 'bg-red-100 text-red-800 border border-red-300'
                                                : selectedAnswer !== null && option === currentQuestion.translation
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Next button */}
                    {(selectedAnswer !== null || isCorrectFill !== null) && (
                        <button
                            onClick={handleNextQuestion}
                            className="w-full bg-[#FF6B8B] text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                        >
                            {currentQuestionIndex < filteredQuestions.length - 1 ? 'Next Question' : 'See Results'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

