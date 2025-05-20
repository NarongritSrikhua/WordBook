'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext';

const DashboardClient = () => {
    // Add state for active tab
    const [activeTab, setActiveTab] = useState('overview')
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Enhanced Header with gradient background */}
            <div className="bg-gradient-to-r from-[#FADADD] to-[#FF6B8B] rounded-2xl p-8 mb-8 shadow-lg">
                <h1 className="text-3xl font-bold text-white mb-4">Your Learning Dashboard</h1>
                <p className="text-white opacity-90">Track your progress and manage your vocabulary lists</p>
                
                {/* Quick action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <Link href="/flashcards" className="bg-white text-[#FF6B8B] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-md">
                        Study Flashcards
                    </Link>
                    <Link href="/practice" className="bg-white text-[#FF6B8B] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-md">
                        Practice Quiz
                    </Link>
                    
                    {/* Admin Dashboard Link - Only visible for admin users */}
                    {isAdmin && (
                        <Link href="/admin/dashboard" className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-md flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Admin Dashboard
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Overview with improved visuals */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#FADADD] hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800">Words Learned</h3>
                    <p className="text-3xl font-bold text-[#FF6B8B]">150</p>
                    <p className="text-sm text-gray-500 mt-2">+12 this week</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#FADADD] hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800">Current Streak</h3>
                    <p className="text-3xl font-bold text-[#FF6B8B]">7 days</p>
                    <p className="text-sm text-gray-500 mt-2">Keep it up!</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#FADADD] hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800">Time Spent</h3>
                    <p className="text-3xl font-bold text-[#FF6B8B]">5.2 hrs</p>
                    <p className="text-sm text-gray-500 mt-2">This month</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#FADADD] hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800">Achievements</h3>
                    <p className="text-3xl font-bold text-[#FF6B8B]">12</p>
                    <p className="text-sm text-gray-500 mt-2">3 new unlocked</p>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview' 
                                ? 'border-[#FF6B8B] text-[#FF6B8B]' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('vocabulary')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'vocabulary' 
                                ? 'border-[#FF6B8B] text-[#FF6B8B]' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Vocabulary Lists
                    </button>
                    <button 
                        onClick={() => setActiveTab('activity')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'activity' 
                                ? 'border-[#FF6B8B] text-[#FF6B8B]' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Recent Activity
                    </button>
                </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                            <button className="text-sm text-[#FF6B8B] hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start border-b pb-3">
                                <div className="bg-[#FADADD] p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-800 font-medium">Completed Chapter 3</p>
                                    <p className="text-sm text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-start border-b pb-3">
                                <div className="bg-[#FADADD] p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-800 font-medium">Learned 10 new words</p>
                                    <p className="text-sm text-gray-500">Yesterday</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-[#FADADD] p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-800 font-medium">Started Chapter 4</p>
                                    <p className="text-sm text-gray-500">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vocabulary Lists */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Your Vocabulary Lists</h2>
                            <button className="text-sm text-[#FF6B8B] hover:underline">Create New</button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div className="flex items-center">
                                    <div className="bg-[#FADADD] p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-800 font-medium">Basic Words</p>
                                        <p className="text-sm text-gray-500">20 words • 75% mastered</p>
                                    </div>
                                </div>
                                <button className="bg-[#FADADD] text-[#FF6B8B] px-3 py-1 rounded-md hover:bg-pink-200 transition-colors">Review</button>
                            </div>
                            <div className="flex items-center justify-between border-b pb-3">
                                <div className="flex items-center">
                                    <div className="bg-[#FADADD] p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-800 font-medium">Advanced Vocabulary</p>
                                        <p className="text-sm text-gray-500">15 words • 40% mastered</p>
                                    </div>
                                </div>
                                <button className="bg-[#FADADD] text-[#FF6B8B] px-3 py-1 rounded-md hover:bg-pink-200 transition-colors">Review</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-[#FADADD] p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-800 font-medium">Daily Practice</p>
                                        <p className="text-sm text-gray-500">30 words • 60% mastered</p>
                                    </div>
                                </div>
                                <button className="bg-[#FADADD] text-[#FF6B8B] px-3 py-1 rounded-md hover:bg-pink-200 transition-colors">Review</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'vocabulary' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">All Vocabulary Lists</h2>
                        <button className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">
                            Create New List
                        </button>
                    </div>
                    
                    {/* List of vocabulary sets with more details */}
                    <div className="space-y-4">
                        {/* Repeat for each vocabulary list */}
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">Basic Words</h3>
                                    <p className="text-sm text-gray-500 mt-1">Created 2 weeks ago • Last studied yesterday</p>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">75% Mastered</span>
                            </div>
                            <div className="mt-4 flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-[#FF6B8B] h-2.5 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-600">15/20</span>
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <button className="bg-[#FF6B8B] text-white px-3 py-1 rounded-md hover:bg-pink-600 transition-colors">
                                    Study
                                </button>
                                <button className="bg-white text-[#FF6B8B] border border-[#FF6B8B] px-3 py-1 rounded-md hover:bg-pink-50 transition-colors">
                                    Edit
                                </button>
                            </div>
                        </div>
                        
                        {/* More vocabulary lists would go here */}
                    </div>
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Your Learning Activity</h2>
                    
                    {/* Activity timeline */}
                    <div className="relative border-l-2 border-[#FADADD] pl-6 ml-3 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-9 mt-1.5 w-4 h-4 rounded-full bg-[#FF6B8B]"></div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Completed Chapter 3</h3>
                                <time className="text-xs text-gray-500">Today, 2:30 PM</time>
                                <p className="mt-1 text-gray-600">You scored 85% on the chapter quiz.</p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute -left-9 mt-1.5 w-4 h-4 rounded-full bg-[#FF6B8B]"></div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Learned 10 New Words</h3>
                                <time className="text-xs text-gray-500">Yesterday</time>
                                <p className="mt-1 text-gray-600">Added 10 new words to your vocabulary list.</p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute -left-9 mt-1.5 w-4 h-4 rounded-full bg-[#FF6B8B]"></div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Started Chapter 4</h3>
                                <time className="text-xs text-gray-500">Yesterday</time>
                                <p className="mt-1 text-gray-600">Began studying Chapter 4 today.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardClient
