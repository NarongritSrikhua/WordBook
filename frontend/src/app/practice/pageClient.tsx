'use client';

import React, { useState, useEffect, useRef, createRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getRandomPracticeQuestions,
  getPracticeQuestions,
  getPracticeSets,
  getPracticeSet,
  getCategories,
  PracticeQuestion,
  PracticeSet,
  submitPracticeResult
} from '@/app/lib/api/practice';
import Image from 'next/image';
import PracticeCompletion from './components/practice-completion';
import { getCurrentSession } from '@/app/lib/api/auth';
import { useAuth } from '@/app/context/AuthContext';

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

    // Add this state to track if the result has been submitted
    const [resultSubmitted, setResultSubmitted] = useState(false);

    // State for user ID
    const [userId, setUserId] = useState<string | null>(null);
    const { user } = useAuth();

    // Add this state to store a custom user ID for testing
    const [customUserId, setCustomUserId] = useState<string | null>(null);

    // Add these to your state variables
    const [letterInputs, setLetterInputs] = useState<string[]>([]);
    const [inputRefs, setInputRefs] = useState<React.RefObject<HTMLInputElement>[]>([]);
    
    // Add this useEffect to handle the creation of input refs for word-type questions
    useEffect(() => {
        // Get the current question inside the effect to avoid duplicate declarations
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        
        if (currentQuestion && 
            currentQuestion.type === 'fill' && 
            currentQuestion.fillType === 'word' && 
            currentQuestion.fillWord) {
            
            const blankCount = (currentQuestion.fillWord.match(/_/g) || []).length;
            
            // Initialize letter inputs array with empty strings
            setLetterInputs(Array(blankCount).fill(''));
            
            // Create refs for each input
            const refs = Array(blankCount).fill(0).map(() => React.createRef<HTMLInputElement>());
            setInputRefs(refs);
        } else if (currentQuestion && 
                   currentQuestion.type === 'fill' && 
                   currentQuestion.fillType === 'word' && 
                   !currentQuestion.fillWord) {
            // Log warning for debugging
            console.warn('Word-type fill question is missing fillWord property:', currentQuestion);
        }
    }, [filteredQuestions, currentQuestionIndex]);

    // Add this function to handle input changes for word-type questions
    const handleLetterInputChange = (index: number, value: string) => {
        // Only allow single letters
        if (value.length > 1) return;
        
        const newInputs = [...letterInputs];
        newInputs[index] = value;
        setLetterInputs(newInputs);
        
        // Auto-advance to next input if a letter was entered
        if (value && index < inputRefs.length - 1) {
            inputRefs[index + 1].current?.focus();
        }
    };

    // Add this function to handle key presses for word-type questions
    const handleLetterKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace to go to previous input
        if (e.key === 'Backspace' && !letterInputs[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

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
            console.log('Practice session completed. Showing results.');
            console.log('Score:', score, 'out of', filteredQuestions.length);
            setShowResults(true);
            setTimerActive(false);
        }
    };

    const handleFillSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Get the current question from the filtered questions array
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        if (!currentQuestion) return;
        
        if (currentQuestion.fillType === 'sentence') {
            if (userInput.trim() === '') return;
            
            setTimerActive(false); // Pause timer when answer is submitted
            
            // Check against main answer
            const isCorrect = userInput.toLowerCase().trim() === (currentQuestion.answer?.toLowerCase().trim() || '');
            setIsCorrectFill(isCorrect);
            
            if (isCorrect) {
                setScore(score + 1);
                setStreak(streak + 1);
            } else {
                setStreak(0); // Reset streak on wrong answer
            }
        } else if (currentQuestion.fillType === 'word' && currentQuestion.fillWord) {
            // For word-type questions, combine the letter inputs with the visible letters
            setTimerActive(false);
            
            // Get the complete word from the user's inputs
            let userWord = '';
            let inputIndex = 0;
            
            for (const char of currentQuestion.fillWord) {
                if (char === '_') {
                    userWord += letterInputs[inputIndex] || '';
                    inputIndex++;
                } else {
                    userWord += char;
                }
            }
            
            // Check if the user's word matches the answer
            const isCorrect = userWord.toLowerCase() === (currentQuestion.answer?.toLowerCase() || '');
            setIsCorrectFill(isCorrect);
            
            if (isCorrect) {
                setScore(score + 1);
                setStreak(streak + 1);
            } else {
                setStreak(0);
            }
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

    // Add this useEffect to handle result submission
    useEffect(() => {
        if (showResults && !resultSubmitted && filteredQuestions.length > 0) {
            const submitResult = async () => {
                try {
                    // Log all relevant information
                    console.log('Preparing to submit practice result with:', {
                        userId,
                        userFromContext: user?.id,
                        selectedCategory,
                        selectedSetId,
                        questionsCount: filteredQuestions.length,
                        score,
                        percentage: Math.round((score / filteredQuestions.length) * 100)
                    });
                    
                    // Try to get the user ID from multiple sources
                    const effectiveUserId = userId || user?.id || customUserId || 'explicit-test-user';
                    console.log('Using effective user ID for submission:', effectiveUserId);
                    
                    // Store the user ID in localStorage for history page
                    localStorage.setItem('lastUsedUserId', effectiveUserId);
                    
                    const result = await submitPracticeResult({
                        userId: effectiveUserId, // Explicitly include the user ID
                        category: selectedCategory,
                        practiceSetId: selectedSetId,
                        totalQuestions: filteredQuestions.length,
                        correctAnswers: score,
                        score: Math.round((score / filteredQuestions.length) * 100),
                        timeTaken: 30 * filteredQuestions.length - timer
                    });
                    
                    console.log('Practice result submitted successfully:', result);
                    setResultSubmitted(true);
                    
                    // Add a slight delay before redirecting
                    setTimeout(() => {
                        // Redirect to the history page
                        router.push('/practice/history');
                    }, 2000);
                } catch (error) {
                    console.error('Failed to submit practice result:', error);
                }
            };
            
            submitResult();
        }
    }, [showResults, resultSubmitted, userId, user, customUserId, selectedCategory, selectedSetId, filteredQuestions.length, score, timer, router]);

    // Add this function to get the user ID from localStorage or cookies
    function getUserIdFromBrowser() {
        // Try localStorage first
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            console.log('Found user ID in localStorage:', storedUserId);
            return storedUserId;
        }
        
        // Try to parse the token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    const id = payload.sub || payload.id;
                    if (id) {
                        console.log('Extracted user ID from token:', id);
                        return id;
                    }
                }
            } catch (e) {
                console.error('Failed to parse token:', e);
            }
        }
        
        // Try to get from cookies
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'userId') {
                console.log('Found user ID in cookies:', value);
                return value;
            }
        }
        
        console.log('Could not find user ID in browser storage');
        return null;
    }

    // Add this useEffect to get the user ID when the component mounts
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                // If you have an auth context, use that
                if (user?.id) {
                    console.log('Using user ID from auth context:', user.id);
                    setUserId(user.id);
                    return;
                }
                
                // Try to get from browser storage
                const browserUserId = getUserIdFromBrowser();
                if (browserUserId) {
                    console.log('Using user ID from browser storage:', browserUserId);
                    setUserId(browserUserId);
                    return;
                }
                
                // Otherwise, fetch the session
                const session = await getCurrentSession();
                if (session?.user?.id) {
                    console.log('Using user ID from session:', session.user.id);
                    setUserId(session.user.id);
                } else {
                    console.log('No user ID found in session');
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };
        
        fetchUserId();
    }, [user]);

    // Add this console log to debug the user ID
    useEffect(() => {
        console.log('Current user state:', {
            contextUser: user,
            userId: userId,
            isAuthenticated: !!user
        });
    }, [user, userId]);

    // Add this useEffect to set a custom user ID for testing
    useEffect(() => {
        // For testing purposes, generate a consistent user ID
        const testUserId = 'test-user-' + Math.floor(Math.random() * 1000);
        setCustomUserId(testUserId);
        console.log('Set custom user ID for testing:', testUserId);
        
        // Store it in localStorage for persistence
        localStorage.setItem('testUserId', testUserId);
    }, []);

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

    // Replace the existing results display with this enhanced version
    if (showResults) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B8B] to-[#FF8E53] opacity-90"></div>
                        <div className="relative p-6 text-center text-white">
                            <h2 className="text-3xl font-bold mb-2">Practice Complete!</h2>
                            <p className="text-lg opacity-90">Great job on completing your practice session</p>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {/* Score display - Fixed percentage display */}
                        <div className="flex justify-center mb-6">
                            <div className="relative w-32 h-32">
                                <svg className="w-32 h-32" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#EEEEEE"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#FF6B8B"
                                        strokeWidth="3"
                                        strokeDasharray={`${Math.round((score / filteredQuestions.length) * 100)}, 100`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-800">
                                        {Math.round((score / filteredQuestions.length) * 100)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">percent</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-500 mb-1">Questions</p>
                                <p className="text-2xl font-bold text-gray-800">{filteredQuestions.length}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-500 mb-1">Correct</p>
                                <p className="text-2xl font-bold text-green-600">{score}</p>
                            </div>
                            {selectedCategory && (
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-500 mb-1">Category</p>
                                    <p className="text-lg font-semibold text-blue-600">{selectedCategory}</p>
                                </div>
                            )}
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-500 mb-1">Time</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {Math.floor((30 * filteredQuestions.length - timer) / 60)}:
                                    {((30 * filteredQuestions.length - timer) % 60).toString().padStart(2, '0')}
                                </p>
                            </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={restartPractice}
                                className="w-full py-3 px-4 bg-[#FF6B8B] text-white rounded-lg font-medium hover:bg-[#FF5277] transition-colors shadow-md hover:shadow-lg"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={backToSetSelection}
                                className="w-full py-3 px-4 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Back to Practice Sets
                            </button>
                            <button
                                onClick={() => router.push('/practice/history')}
                                className="w-full py-3 px-4 bg-white text-[#FF6B8B] border border-[#FF6B8B] rounded-lg font-medium hover:bg-pink-50 transition-colors"
                            >
                                View History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Add a check to ensure we have a valid question before rendering
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) {
        return <div className="text-center p-8">No questions available. Please try again later.</div>;
    }

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
                            {currentQuestion.fillType === 'sentence' ? (
                              // Sentence with blank
                              <>
                                <h2 className="text-xl font-medium mb-4 text-gray-800">
                                  {currentQuestion.fillPrompt ? 
                                    currentQuestion.fillPrompt.split('___').map((part, index, array) => (
                                      <React.Fragment key={index}>
                                        {part}
                                        {index < array.length - 1 && (
                                          <span className={`inline-block min-w-20 border-b-2 mx-1 align-bottom ${
                                            isCorrectFill !== null 
                                              ? isCorrectFill 
                                                ? 'border-green-500' 
                                                : 'border-red-500' 
                                              : 'border-gray-400'
                                          }`}>
                                            {isCorrectFill !== null ? (
                                              <span className={`text-${isCorrectFill ? 'green' : 'red'}-600 font-medium`}>
                                                {isCorrectFill ? userInput : currentQuestion.answer}
                                              </span>
                                            ) : (
                                              <input
                                                type="text"
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                disabled={isCorrectFill !== null}
                                                className="w-full bg-transparent border-none focus:outline-none text-center"
                                                autoFocus
                                              />
                                            )}
                                          </span>
                                        )}
                                      </React.Fragment>
                                    ))
                                    : <p>Error: Missing fill prompt</p>
                                  }
                                </h2>
                              </>
                            ) : currentQuestion.fillType === 'word' && currentQuestion.fillWord ? (
                              // Word with missing letters
                              <>
                                <h2 className="text-xl font-medium mb-4 text-gray-800">
                                  {currentQuestion.fillPrompt || "Fill in the missing letters"}
                                </h2>
                                
                                <div className="flex justify-center space-x-2 mb-6">
                                  {currentQuestion.fillWord.split('').map((char, charIndex) => {
                                    // Track which blank we're on
                                    if (char === '_') {
                                      const blankIndex = currentQuestion.fillWord
                                        .substring(0, charIndex)
                                        .split('')
                                        .filter(c => c === '_')
                                        .length;
                                      
                                      return (
                                        <div key={charIndex} className="text-center">
                                          <div className={`w-10 h-12 border-b-2 flex items-center justify-center ${
                                            isCorrectFill !== null 
                                              ? isCorrectFill 
                                                ? 'border-green-500' 
                                                : 'border-red-500' 
                                              : 'border-gray-400'
                                          }`}>
                                            {isCorrectFill !== null ? (
                                              <span className={`text-xl font-medium text-${isCorrectFill ? 'green' : 'red'}-600`}>
                                                {currentQuestion.answer && 
                                                 currentQuestion.answer.charAt(charIndex)}
                                              </span>
                                            ) : (
                                              <input
                                                ref={inputRefs[blankIndex]}
                                                type="text"
                                                maxLength={1}
                                                value={letterInputs[blankIndex] || ''}
                                                onChange={(e) => handleLetterInputChange(blankIndex, e.target.value)}
                                                onKeyDown={(e) => handleLetterKeyDown(blankIndex, e)}
                                                disabled={isCorrectFill !== null}
                                                className="w-full h-full bg-transparent border-none focus:outline-none text-center text-xl"
                                                autoFocus={blankIndex === 0}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div key={charIndex} className="text-center">
                                          <div className="w-10 h-12 flex items-center justify-center">
                                            <span className="text-xl font-medium">{char}</span>
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              </>
                            ) : (
                              // Handle legacy fill questions or missing data
                              <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
                                <p>This question is missing required data. Please try another question.</p>
                                <button 
                                  onClick={handleNextQuestion} 
                                  className="mt-2 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                  Skip to Next Question
                                </button>
                              </div>
                            )}
                            
                            {/* Submit button */}
                            {isCorrectFill === null && currentQuestion.fillType && (
                              <button
                                onClick={handleFillSubmit}
                                className="mt-4 px-6 py-2 bg-[#FF6B8B] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                              >
                                Check Answer
                              </button>
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
};
