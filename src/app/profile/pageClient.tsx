'use client';
import { useState } from 'react';

const ProfileClient = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        level: 'Intermediate',
        targetLanguage: 'Thai',
        dailyGoal: '30 minutes',
        notifications: true
    });

    const handleSave = () => {
        setIsEditing(false);
        // Here you would typically save to backend
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Profile Header */}
                <div className="bg-[#FADADD] rounded-t-2xl p-8 text-center">
                    <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl text-[#FADADD]">{profile.name[0]}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
                    <p className="text-white opacity-90">{profile.email}</p>
                </div>

                {/* Profile Content */}
                <div className="bg-white rounded-b-2xl shadow-md p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Profile Settings</h2>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className="bg-[#FADADD] text-white px-4 py-2 rounded-lg hover:bg-pink-400 transition-colors"
                        >
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Learning Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Learning Level
                            </label>
                            {isEditing ? (
                                <select 
                                    value={profile.level}
                                    onChange={(e) => setProfile({...profile, level: e.target.value})}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            ) : (
                                <p className="text-gray-800">{profile.level}</p>
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
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option>Thai</option>
                                    <option>English</option>
                                    <option>Japanese</option>
                                </select>
                            ) : (
                                <p className="text-gray-800">{profile.targetLanguage}</p>
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
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option>15 minutes</option>
                                    <option>30 minutes</option>
                                    <option>45 minutes</option>
                                    <option>1 hour</option>
                                </select>
                            ) : (
                                <p className="text-gray-800">{profile.dailyGoal}</p>
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
                                    className="form-checkbox h-5 w-5 text-[#FADADD]"
                                />
                                <span className="text-gray-700">Enable notifications</span>
                            </label>
                        </div>
                    </div>

                    {/* Achievement Section */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Achievements</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-[#FADADD] mb-2">7</div>
                                <div className="text-sm text-gray-600">Day Streak</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-[#FADADD] mb-2">150</div>
                                <div className="text-sm text-gray-600">Words Learned</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-[#FADADD] mb-2">12</div>
                                <div className="text-sm text-gray-600">Quizzes Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileClient;