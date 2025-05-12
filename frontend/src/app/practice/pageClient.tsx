'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Question {
    type: 'text' | 'image' | 'fill';
    word?: string;
    imageUrl?: string;
    translation: string;
    options?: string[];
    fillPrompt?: string;
    answer?: string;
}

const PracticeClient = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per question
    const [timerActive, setTimerActive] = useState(true);
    const [animation, setAnimation] = useState('');
    const [streak, setStreak] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [quizType, setQuizType] = useState<'text' | 'image' | 'fill' | 'mixed'>('mixed');
    const [isCorrectFill, setIsCorrectFill] = useState<boolean | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const questions: Question[] = [
        // Text-based questions
        {
            type: 'text',
            word: "Hello",
            translation: "สวัสดี",
            options: ["สวัสดี", "ขอบคุณ", "ลาก่อน", "ได้จัก"]
        },
        {
            type: 'text',
            word: "Thank you",
            translation: "ขอบคุณ",
            options: ["สวัสดี", "ขอบคุณ", "ลาก่อน", "ได้จัก"]
        },
        // Image-based questions
        {
            type: 'image',
            // imageUrl: "/images/apple.png",
            translation: "แอปเปิล",
            options: ["แอปเปิล", "กล้วย", "ส้ม", "มะม่วง"]
        },
        {
            type: 'image',
            imageUrl: "/images/cat.jpg",
            translation: "แมว",
            options: ["หมา", "แมว", "นก", "ปลา"]
        },
        // Fill-in-the-blank questions
        {
            type: 'fill',
            fillPrompt: "H_ll_",
            answer: "Hello",
            translation: "สวัสดี"
        },
        {
            type: 'fill',
            fillPrompt: "Th__k y_u",
            answer: "thank you",
            translation: "ขอบคุณ"
        },
        {
            type: 'fill',
            fillPrompt: "C__",
            answer: "cat",
            translation: "แมว"
        },
        {
            type: 'image',
            imageUrl: "/images/house.jpg",
            translation: "บ้าน",
            options: ["บ้าน", "ร้าน", "ร้านอาหาร", "โรงแรม"]
        },
        {
            type: 'text',
            word: "Goodbye",
            translation: "ลาก่อน",
            options: ["สวัสดี", "ขอบคุณ", "ลาก่อน", "ได้จัก"]
        },
    ];

    // Filter questions based on quiz type
    const filteredQuestions = questions.filter(q => 
        quizType === 'mixed' || q.type === quizType
    );

    // Add a guard clause to prevent rendering if filteredQuestions is empty
    if (filteredQuestions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-4">No questions available for this quiz type.</p>
                        <button
                            onClick={() => setQuizType('mixed')}
                            className="bg-[#FF6B8B] text-white px-6 py-3 rounded-lg hover:bg-pink-500 transition-colors font-medium mr-4"
                        >
                            Try Mixed Quiz
                        </button>
                        <Link
                            href="/dashboard"
                            className="bg-white text-[#FF6B8B] border-2 border-[#FF6B8B] px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Check if currentQuestionIndex is valid
    if (currentQuestionIndex >= filteredQuestions.length) {
        setCurrentQuestionIndex(0);
        return null; // Return null during the re-render cycle
    }

    const currentQuestion = filteredQuestions[currentQuestionIndex];

    // Focus input field when fill question is shown
    useEffect(() => {
        if (filteredQuestions[currentQuestionIndex]?.type === 'fill' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentQuestionIndex, filteredQuestions]);

    // Timer effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (timerActive && timeLeft > 0 && !showResult) {
            timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && !showResult) {
            // Time's up, move to next question
            handleTimeUp();
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [timeLeft, timerActive, showResult]);

    const handleTimeUp = () => {
        setStreak(0); // Reset streak on timeout
        setSelectedAnswer(null);
        setUserInput('');
        setIsCorrectFill(null);
        
        setTimeout(() => {
            if (currentQuestionIndex < filteredQuestions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setTimeLeft(15); // Reset timer
            } else {
                setShowResult(true);
            }
        }, 1000);
    };

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
        
        setTimeout(() => {
            setAnimation('slide-out');
            
            setTimeout(() => {
                if (currentQuestionIndex < filteredQuestions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setSelectedAnswer(null);
                    setTimeLeft(15); // Reset timer
                    setTimerActive(true); // Resume timer for next question
                    setShowHint(false);
                } else {
                    setShowResult(true);
                }
                setAnimation('slide-in');
            }, 300);
            
            setTimeout(() => {
                setAnimation('');
            }, 600);
        }, 1000);
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
        
        setTimeout(() => {
            setAnimation('slide-out');
            
            setTimeout(() => {
                if (currentQuestionIndex < filteredQuestions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setUserInput('');
                    setIsCorrectFill(null);
                    setTimeLeft(15); // Reset timer
                    setTimerActive(true); // Resume timer for next question
                    setShowHint(false);
                } else {
                    setShowResult(true);
                }
                setAnimation('slide-in');
            }, 300);
            
            setTimeout(() => {
                setAnimation('');
            }, 600);
        }, 1500);
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setUserInput('');
        setIsCorrectFill(null);
        setTimeLeft(15);
        setTimerActive(true);
        setStreak(0);
        setShowHint(false);
    };

    // Add CSS for animations
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-50px); opacity: 0; }
            }
            
            @keyframes slideIn {
                from { transform: translateX(50px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .slide-out {
                animation: slideOut 0.3s forwards;
            }
            
            .slide-in {
                animation: slideIn 0.3s forwards;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Quiz type selection screen
    if (!showResult && currentQuestionIndex === 0 && selectedAnswer === null && isCorrectFill === null && quizType === 'mixed') {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Choose Quiz Type</h2>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => setQuizType('text')}
                                className="bg-white border-2 border-[#FF6B8B] text-[#FF6B8B] p-4 rounded-xl hover:bg-pink-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-[#FADADD] rounded-full flex items-center justify-center mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold">Text Quiz</h3>
                                        <p className="text-sm text-gray-600">Translate words from English to Thai</p>
                                    </div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => setQuizType('image')}
                                className="bg-white border-2 border-[#FF6B8B] text-[#FF6B8B] p-4 rounded-xl hover:bg-pink-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-[#FADADD] rounded-full flex items-center justify-center mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold">Image Quiz</h3>
                                        <p className="text-sm text-gray-600">Name objects shown in images</p>
                                    </div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => setQuizType('fill')}
                                className="bg-white border-2 border-[#FF6B8B] text-[#FF6B8B] p-4 rounded-xl hover:bg-pink-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-[#FADADD] rounded-full flex items-center justify-center mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold">Fill-in-the-Blank</h3>
                                        <p className="text-sm text-gray-600">Complete words by filling in missing letters</p>
                                    </div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    setQuizType('mixed');
                                    // Skip the selection screen next time
                                    setCurrentQuestionIndex(0);
                                    setSelectedAnswer(null);
                                    setTimeLeft(15);
                                    setTimerActive(true);
                                }}
                                className="bg-[#FF6B8B] text-white p-4 rounded-xl hover:bg-pink-600 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold">Mixed Quiz</h3>
                                        <p className="text-sm text-white text-opacity-80">Combination of all question types</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fill-in-the-blank questions
    if (currentQuestion?.type === 'fill' && !showResult) {
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
                            
                            {/* Progress bar */}
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-2 bg-[#FF6B8B] rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex) / filteredQuestions.length) * 100}%` }}
                                ></div>
                            </div>
                            
                            {/* Timer and streak */}
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className={`text-sm ${timeLeft <= 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{timeLeft}s</span>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                    </svg>
                                    <span className="text-sm text-orange-500 font-bold">{streak}</span>
                                </div>
                            </div>
                        </div>

                        {/* Question */}
                        <div className={`mb-8 ${animation}`}>
                            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                                Fill in the missing letters:
                            </h2>
                            <div className="bg-[#FADADD] bg-opacity-20 p-6 rounded-xl text-center">
                                <p className="text-3xl font-bold text-[#FF6B8B] font-mono tracking-wider">
                                    {currentQuestion.fillPrompt}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    (Thai: {currentQuestion.translation})
                                </p>
                            </div>
                        </div>

                        {/* Fill-in-the-blank input */}
                        <form onSubmit={handleFillSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    disabled={isCorrectFill !== null}
                                    placeholder="Type your answer here..."
                                    className={`w-full p-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B8B] focus:border-transparent ${
                                        isCorrectFill === null 
                                            ? 'border-gray-200' 
                                            : isCorrectFill 
                                            ? 'border-green-300 bg-green-50' 
                                            : 'border-red-300 bg-red-50'
                                    }`}
                                />
                                {isCorrectFill !== null && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        {isCorrectFill ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {isCorrectFill === false && (
                                <div className="text-center text-red-500">
                                    <p>Correct answer: <span className="font-bold">{currentQuestion.answer}</span></p>
                                </div>
                            )}
                            
                            {isCorrectFill === null && (
                                <button
                                    type="submit"
                                    className="w-full bg-[#FF6B8B] text-white px-6 py-3 rounded-lg hover:bg-pink-500 transition-colors font-medium"
                                >
                                    Submit
                                </button>
                            )}
                        </form>
                        
                        {/* Skip button */}
                        {isCorrectFill === null && (
                            <div className="text-center mt-6">
                                <button
                                    onClick={handleTimeUp}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Skip this question
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (showResult) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
                    <div className="p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
                            <div className="mb-6">
                                <div className="text-5xl font-bold text-[#FF6B8B] mb-2">{score}</div>
                                <div className="text-gray-600">out of {filteredQuestions.length} correct</div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="text-gray-700 mb-2">Your performance</div>
                                <div className="flex justify-between items-center">
                                    <div className="text-left">
                                        <div className="text-sm text-gray-500">Accuracy</div>
                                        <div className="font-bold">{Math.round((score / filteredQuestions.length) * 100)}%</div>
                                    </div>
                                    <div className="h-10 w-px bg-gray-200"></div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500">Best Streak</div>
                                        <div className="font-bold">{streak}</div>
                                    </div>
                                    <div className="h-10 w-px bg-gray-200"></div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Time</div>
                                        <div className="font-bold">{filteredQuestions.length * 15 - timeLeft}s</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        resetQuiz();
                                        setQuizType('mixed');
                                    }}
                                    className="bg-[#FF6B8B] text-white px-6 py-3 rounded-lg hover:bg-pink-500 transition-colors font-medium"
                                >
                                    Practice Again
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="bg-white text-[#FF6B8B] border-2 border-[#FF6B8B] px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                        
                        {/* Progress bar */}
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-2 bg-[#FF6B8B] rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestionIndex) / filteredQuestions.length) * 100}%` }}
                            ></div>
                        </div>
                        
                        {/* Timer and streak */}
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className={`text-sm ${timeLeft <= 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{timeLeft}s</span>
                            </div>
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                </svg>
                                <span className="text-sm text-orange-500 font-bold">{streak}</span>
                            </div>
                        </div>
                    </div>

                    {/* Question */}
                    <div className={`mb-8 ${animation}`}>
                        {currentQuestion.type === 'text' && (
                            <>
                                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                                    Translate:
                                </h2>
                                <div className="bg-[#FADADD] bg-opacity-20 p-6 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-[#FF6B8B]">"{currentQuestion.word}"</p>
                                </div>
                            </>
                        )}
                        
                        {currentQuestion.type === 'image' && (
                            <>
                                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                                    What is this in Thai?
                                </h2>
                                <div className="bg-[#FADADD] bg-opacity-20 p-4 rounded-xl text-center">
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                        <Image 
                                            src={currentQuestion.imageUrl || '/images/placeholder.jpg'} 
                                            alt="Guess this word"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            className="rounded-lg"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {currentQuestion.type === 'fill' && (
                            <>
                                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                                    Fill in the missing letters:
                                </h2>
                                <div className="bg-[#FADADD] bg-opacity-20 p-6 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-[#FF6B8B] font-mono tracking-wider">
                                        {currentQuestion.fillPrompt}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        (Thai: {currentQuestion.translation})
                                    </p>
                                </div>
                            </>
                        )}
                        
                        {/* Hint button - only for text and image questions */}
                        {(currentQuestion.type === 'text' || currentQuestion.type === 'image') && (
                            <div className="text-center mt-2">
                                <button 
                                    onClick={() => setShowHint(!showHint)}
                                    className="text-sm text-gray-500 hover:text-[#FF6B8B] transition-colors"
                                >
                                    {showHint ? 'Hide hint' : 'Show hint'}
                                </button>
                                {showHint && (
                                    <p className="text-sm text-gray-600 mt-1 italic">First letter: {currentQuestion.translation.charAt(0)}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Multiple choice answers for text and image questions */}
                    {(currentQuestion.type === 'text' || currentQuestion.type === 'image') && (
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    disabled={selectedAnswer !== null}
                                    className={`w-full p-4 text-left rounded-lg transition-colors ${
                                        selectedAnswer === null 
                                            ? 'hover:bg-gray-100 border border-gray-200' 
                                            : option === currentQuestion.translation
                                            ? 'bg-green-100 border border-green-300'
                                            : selectedAnswer === option
                                            ? 'bg-red-100 border border-red-300'
                                            : 'border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-gray-600">
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="text-lg">{option}</span>
                                        
                                        {selectedAnswer !== null && (
                                            <>
                                                {option === currentQuestion.translation && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                {selectedAnswer === option && option !== currentQuestion.translation && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {/* Fill-in-the-blank input for fill questions */}
                    {currentQuestion.type === 'fill' && (
                        <form onSubmit={handleFillSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    disabled={isCorrectFill !== null}
                                    placeholder="Type your answer here..."
                                    className={`w-full p-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B8B] focus:border-transparent ${
                                        isCorrectFill === null 
                                            ? 'border-gray-200' 
                                            : isCorrectFill 
                                            ? 'border-green-300 bg-green-50' 
                                            : 'border-red-300 bg-red-50'
                                    }`}
                                />
                                {isCorrectFill !== null && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        {isCorrectFill ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {isCorrectFill === false && (
                                <div className="text-center text-red-500">
                                    <p>Correct answer: <span className="font-bold">{currentQuestion.answer}</span></p>
                                </div>
                            )}
                            
                            {isCorrectFill === null && (
                                <button
                                    type="submit"
                                    className="bg-[#FF6B8B] text-white px-6 py-3 rounded-lg hover:bg-pink-500 transition-colors font-medium"
                                >
                                    Submit
                                </button>
                            )}
                        </form>
                    )}
                    
                    {/* Skip button */}
                    {selectedAnswer === null && currentQuestion.type !== 'fill' && (
                        <div className="text-center mt-6">
                            <button
                                onClick={handleTimeUp}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Skip this question
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeClient;







