'use client';
import { useState } from 'react';

interface Question {
    word: string;
    translation: string;
    options: string[];
}

const PracticeClient = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const questions: Question[] = [
        {
            word: "Hello",
            translation: "สวัสดี",
            options: ["สวัสดี", "ขอบคุณ", "ลาก่อน", "ยินดีที่ได้รู้จัก"]
        },
        {
            word: "Thank you",
            translation: "ขอบคุณ",
            options: ["สวัสดี", "ขอบคุณ", "ลาก่อน", "ยินดีที่ได้รู้จัก"]
        },
        {
            word: "Goodbye",
            translation: "ลาก่อน",
            options: ["สวัสดี", "ขอบคุณ", "ลาก่อน", "ยินดีที่ได้รู้จัก"]
        },
    ];

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        if (answer === questions[currentQuestionIndex].translation) {
            setScore(score + 1);
        }
        
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
            }
        }, 1000);
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
    };

    if (showResult) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                    <div className="p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
                            <p className="text-xl mb-4">Your score: {score} out of {questions.length}</p>
                            <button
                                onClick={resetQuiz}
                                className="bg-[#FADADD] text-white px-6 py-2 rounded-lg hover:bg-pink-400 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <span className="text-gray-600">Score: {score}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded">
                            <div 
                                className="h-2 bg-[#FADADD] rounded"
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-6">
                        Translate: "{questions[currentQuestionIndex].word}"
                    </h2>

                    <div className="space-y-4">
                        {questions[currentQuestionIndex].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                disabled={selectedAnswer !== null}
                                className={`w-full p-4 text-left rounded-lg transition-colors ${
                                    selectedAnswer === null 
                                        ? 'hover:bg-gray-100' 
                                        : option === questions[currentQuestionIndex].translation
                                        ? 'bg-green-100'
                                        : selectedAnswer === option
                                        ? 'bg-red-100'
                                        : ''
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeClient;