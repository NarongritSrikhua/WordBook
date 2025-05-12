'use client'
import Image from 'next/image';
import Link from 'next/link';

const HomeClient = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-[#FADADD] to-white py-20 px-4">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-800 leading-tight">
                            Learn vocabulary <span className="text-[#FF6B8B]">Word Book</span>
                        </h1>
                        <p className="text-xl text-gray-700 mb-8 max-w-lg">
                            Master new words with our interactive flashcards, personalized learning paths, and spaced repetition system.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                href="/flashcards" 
                                className="bg-[#FF6B8B] text-white px-8 py-4 rounded-xl hover:bg-[#ff5c7f] transition-colors inline-block text-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Start Learning
                            </Link>
                            {/* <Link 
                                href="/book" 
                                className="bg-white text-[#FF6B8B] border-2 border-[#FF6B8B] px-8 py-4 rounded-xl hover:bg-pink-50 transition-colors inline-block text-center font-medium"
                            >
                                Explore Books
                            </Link> */}
                        </div>
                    </div>
                    <div className="md:w-1/2 relative">
                        <div className="w-full h-[400px] relative">
                            {/* Flashcard examples */}
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FADADD] rounded-2xl transform rotate-6 shadow-xl">
                                <div className="absolute inset-0 bg-white m-4 rounded-xl flex items-center justify-center">
                                    <p className="text-2xl font-bold text-[#FF6B8B]">Hello</p>
                                    {/* <p className="absolute bottom-4 text-gray-600">ส</p> */}
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#FADADD] rounded-2xl transform -rotate-3 shadow-xl">
                                <div className="absolute inset-0 bg-white m-4 rounded-xl flex items-center justify-center">
                                    <p className="text-2xl font-bold text-[#FF6B8B]">Thank you</p>
                                    {/* <p className="absolute bottom-4 text-gray-600">ขอบ</p> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">How Word Book helps you learn</h2>
                    
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mb-6 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Interactive Flashcards</h3>
                            <p className="text-gray-600 text-center">
                                Learn with beautifully designed flashcards that make memorization enjoyable and effective.
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mb-6 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Spaced Repetition</h3>
                            <p className="text-gray-600 text-center">
                                Our algorithm ensures you review words at the optimal time for maximum retention.
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mb-6 mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Progress Tracking</h3>
                            <p className="text-gray-600 text-center">
                                Monitor your learning journey with detailed statistics and achievement badges.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeClient
