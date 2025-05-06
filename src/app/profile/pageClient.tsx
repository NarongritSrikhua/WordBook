'use client';
import { useState } from 'react';
import Link from 'next/link';

const ProfileClient = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('settings');
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        level: 'Intermediate',
        targetLanguage: 'Thai',
        dailyGoal: '30 minutes',
        notifications: true,
        theme: 'light',
        soundEffects: true
    });

    const handleSave = () => {
        setIsEditing(false);
        // Here you would typically save to backend
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header with improved visual design */}
                <div className="bg-gradient-to-r from-[#FADADD] to-[#FF6B8B] rounded-t-2xl p-8 text-center relative overflow-hidden">
                    {/* Decorative circles in background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>
                    
                    <div className="relative">
                        <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                            <span className="text-4xl text-[#FF6B8B]">{profile.name[0]}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
                        <p className="text-white opacity-90">{profile.email}</p>
                        
                        <div className="flex justify-center mt-4 space-x-3">
                            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-[#FF6B8B] text-sm">
                                {profile.level}
                            </div>
                            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-[#FF6B8B] text-sm">
                                {profile.targetLanguage}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white border-b">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-3 font-medium text-sm ${
                                activeTab === 'settings'
                                    ? 'border-b-2 border-[#FF6B8B] text-[#FF6B8B]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Profile Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('achievements')}
                            className={`px-4 py-3 font-medium text-sm ${
                                activeTab === 'achievements'
                                    ? 'border-b-2 border-[#FF6B8B] text-[#FF6B8B]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Achievements
                        </button>
                        <button
                            onClick={() => setActiveTab('statistics')}
                            className={`px-4 py-3 font-medium text-sm ${
                                activeTab === 'statistics'
                                    ? 'border-b-2 border-[#FF6B8B] text-[#FF6B8B]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Learning Statistics
                        </button>
                    </nav>
                </div>

                {/* Profile Content */}
                <div className="bg-white rounded-b-2xl shadow-md p-8">
                    {activeTab === 'settings' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Profile Settings</h2>
                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                                >
                                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Learning Preferences</h3>
                                    
                                    {/* Learning Level */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Learning Level
                                        </label>
                                        {isEditing ? (
                                            <select 
                                                value={profile.level}
                                                onChange={(e) => setProfile({...profile, level: e.target.value})}
                                                className="w-full p-2 border rounded-md focus:ring-[#FF6B8B] focus:border-[#FF6B8B]"
                                            >
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Advanced</option>
                                            </select>
                                        ) : (
                                            <div className="p-2 bg-gray-50 rounded-md text-gray-800">{profile.level}</div>
                                        )}
                                    </div>

                                    {/* Target Language */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Language
                                        </label>
                                        {isEditing ? (
                                            <select 
                                                value={profile.targetLanguage}
                                                onChange={(e) => setProfile({...profile, targetLanguage: e.target.value})}
                                                className="w-full p-2 border rounded-md focus:ring-[#FF6B8B] focus:border-[#FF6B8B]"
                                            >
                                                <option>Thai</option>
                                                <option>English</option>
                                                <option>Japanese</option>
                                                <option>Spanish</option>
                                                <option>French</option>
                                            </select>
                                        ) : (
                                            <div className="p-2 bg-gray-50 rounded-md text-gray-800">{profile.targetLanguage}</div>
                                        )}
                                    </div>

                                    {/* Daily Goal */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Daily Learning Goal
                                        </label>
                                        {isEditing ? (
                                            <select 
                                                value={profile.dailyGoal}
                                                onChange={(e) => setProfile({...profile, dailyGoal: e.target.value})}
                                                className="w-full p-2 border rounded-md focus:ring-[#FF6B8B] focus:border-[#FF6B8B]"
                                            >
                                                <option>15 minutes</option>
                                                <option>30 minutes</option>
                                                <option>45 minutes</option>
                                                <option>1 hour</option>
                                            </select>
                                        ) : (
                                            <div className="p-2 bg-gray-50 rounded-md text-gray-800">{profile.dailyGoal}</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">App Settings</h3>
                                    
                                    {/* Theme */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            App Theme
                                        </label>
                                        {isEditing ? (
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        checked={profile.theme === 'light'}
                                                        onChange={() => setProfile({...profile, theme: 'light'})}
                                                        className="mr-2"
                                                    />
                                                    Light
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        checked={profile.theme === 'dark'}
                                                        onChange={() => setProfile({...profile, theme: 'dark'})}
                                                        className="mr-2"
                                                    />
                                                    Dark
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-gray-50 rounded-md text-gray-800 capitalize">{profile.theme}</div>
                                        )}
                                    </div>
                                    
                                    {/* Notifications */}
                                    <div>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={profile.notifications}
                                                onChange={(e) => setProfile({...profile, notifications: e.target.checked})}
                                                disabled={!isEditing}
                                                className="form-checkbox h-5 w-5 text-[#FF6B8B]"
                                            />
                                            <span className="text-gray-700">Enable notifications</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1 ml-8">
                                            Receive reminders about your daily goals and new content
                                        </p>
                                    </div>
                                    
                                    {/* Sound Effects */}
                                    <div>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={profile.soundEffects}
                                                onChange={(e) => setProfile({...profile, soundEffects: e.target.checked})}
                                                disabled={!isEditing}
                                                className="form-checkbox h-5 w-5 text-[#FF6B8B]"
                                            />
                                            <span className="text-gray-700">Enable sound effects</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1 ml-8">
                                            Play sounds for correct/incorrect answers and achievements
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Account Actions */}
                            <div className="mt-10 pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                                        Export My Data
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                                        Change Password
                                    </button>
                                    <button className="text-red-500 hover:text-red-700 text-sm">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'achievements' && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Your Achievements</h2>
                                <p className="text-gray-600">Track your progress and earn badges as you learn</p>
                            </div>
                            
                            {/* Achievement Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-[#FF6B8B] mb-2">7</div>
                                    <div className="text-sm text-gray-600">Day Streak</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-[#FF6B8B] mb-2">150</div>
                                    <div className="text-sm text-gray-600">Words Learned</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-[#FF6B8B] mb-2">12</div>
                                    <div className="text-sm text-gray-600">Quizzes Completed</div>
                                </div>
                            </div>
                            
                            {/* Achievement Badges */}
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Earned Badges</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {/* Repeat for each badge */}
                                <div className="bg-white border rounded-lg p-4 text-center">
                                    <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-800">First Steps</h4>
                                    <p className="text-xs text-gray-500">Complete your first lesson</p>
                                </div>
                                
                                <div className="bg-white border rounded-lg p-4 text-center">
                                    <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-800">Time Keeper</h4>
                                    <p className="text-xs text-gray-500">Study for 7 days in a row</p>
                                </div>
                                
                                <div className="bg-white border rounded-lg p-4 text-center">
                                    <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-800">Perfect Score</h4>
                                    <p className="text-xs text-gray-500">Get 100% on a quiz</p>
                                </div>
                                
                                <div className="bg-white border rounded-lg p-4 text-center opacity-50">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-800">Speed Learner</h4>
                                    <p className="text-xs text-gray-500">Learn 50 words in a week</p>
                                </div>
                            </div>
                            
                            {/* Upcoming Achievements */}
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Next Goals</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-800">Vocabulary Master</h4>
                                            <p className="text-sm text-gray-600">Learn 200 words</p>
                                        </div>
                                        <div className="text-sm text-gray-500">150/200</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div className="bg-[#FF6B8B] h-2.5 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-800">Quiz Champion</h4>
                                            <p className="text-sm text-gray-600">Complete 20 quizzes</p>
                                        </div>
                                        <div className="text-sm text-gray-500">12/20</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div className="bg-[#FF6B8B] h-2.5 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    
                    {activeTab === 'statistics' && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Learning Statistics</h2>
                                <p className="text-gray-600">Track your progress and earn badges as you learn</p>
                            </div>
                            
                            {/* Achievement Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-[#FF6B8B] mb-2">7</div>
                                    <div className="text-sm text-gray-600">Day Streak</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-[#FF6B8B] mb-2">150</div>
                                    <div className="text-sm text-gray-600">Words Learned</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-[#FF6B8B] mb-2">12</div>
                                    <div className="text-sm text-gray-600">Quizzes Completed</div>
                                </div>
                            </div>
                            
                            {/* Achievement Badges */}
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Earned Badges</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {/* Repeat for each badge */}
                                <div className="bg-white border rounded-lg p-4 text-center">
                                    <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-800">First Steps</h4>
                                    <p className="text-xs text-gray-500">Complete your first lesson</p>
                                </div>
                                
                                <div className="bg-white border rounded-lg p-4 text-center">
                                    <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-800">Time Keeper</h4>
                                    <p className="text-xs text-gray-500">Study for 7 days in a row</p>
                                </div>
                                
                                <div className="bg-white border rounded-lg p-4 text-center">
                                    <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-800">Perfect Score</h4>
                                    <p className="text-xs text-gray-500">Get 100% on a quiz</p>
                                </div>
                                
                                <div className="bg-white border rounded-lg p-4 text-center opacity-50">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-800">Speed Learner</h4>
                                    <p className="text-xs text-gray-500">Learn 50 words in a week</p>
                                </div>
                            </div>
                            
                            {/* Upcoming Achievements */}
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Next Goals</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-800">Vocabulary Master</h4>
                                            <p className="text-sm text-gray-600">Learn 200 words</p>
                                        </div>
                                        <div className="text-sm text-gray-500">150/200</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div className="bg-[#FF6B8B] h-2.5 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-800">Quiz Champion</h4>
                                            <p className="text-sm text-gray-600">Complete 20 quizzes</p>
                                        </div>
                                        <div className="text-sm text-gray-500">12/20</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div className="bg-[#FF6B8B] h-2.5 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileClient;
