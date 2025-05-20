'use client';

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    level: 'Intermediate',
    targetLanguage: 'Thai',
    dailyGoal: '30 minutes',
    notifications: true,
    theme: 'light',
    soundEffects: true,
    password: ''
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setMessage('');
    setError('');

    if (!user) return;

    const updateData = {};
    if (profile.name && profile.name !== user.name) updateData.name = profile.name;
    if (profile.password) updateData.password = profile.password;
    
    // Add other profile fields that should be saved to the backend
    const profileData = {
      level: profile.level,
      targetLanguage: profile.targetLanguage,
      dailyGoal: profile.dailyGoal,
      theme: profile.theme,
      notifications: profile.notifications,
      soundEffects: profile.soundEffects
    };
    
    if (Object.keys(updateData).length === 0 && !isEditing) {
      setError('No changes to update');
      return;
    }

    try {
      // Update core user data (name, password)
      if (Object.keys(updateData).length > 0) {
        console.log('Updating user data:', updateData);
        
        // Get token from localStorage or cookies
        const token = localStorage.getItem('token') || '';
        
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          credentials: 'include', // Important: include cookies in the request
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error updating profile:', response.status, errorData);
          
          if (response.status === 401) {
            // Redirect to login if unauthorized
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            throw new Error('Session expired. Please log in again.');
          }
          
          throw new Error(errorData.message || `Failed to update profile (${response.status})`);
        }
        
        const data = await response.json();
        console.log('Profile update response:', data);
      }
      
      // Save preferences to local storage
      localStorage.setItem('userPreferences', JSON.stringify(profileData));
      
      // Optionally, also save preferences to backend
      try {
        const prefResponse = await fetch('/api/users/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(profileData),
        });
        
        if (prefResponse.ok) {
          console.log('Preferences saved to backend');
        }
      } catch (prefError) {
        console.warn('Could not save preferences to backend:', prefError);
        // Non-critical error, don't show to user
      }
      
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setProfile(prev => ({ ...prev, password: '' }));
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'An error occurred while updating your profile');
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header with improved visual design */}
          <div className="bg-gradient-to-r from-[#FADADD] to-[#FF6B8B] rounded-t-2xl p-8 text-center relative overflow-hidden">
            {/* Decorative circles in background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>
            
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white">
                <span className="text-4xl text-[#FF6B8B]">{user?.name?.[0] || '?'}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{user?.name || 'User'}</h1>
              <p className="text-white opacity-90">{user?.email || ''}</p>
              
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
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

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
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Account Information</h3>
                    
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="w-full p-2 border rounded-md focus:ring-[#FF6B8B] focus:border-[#FF6B8B]"
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded-md text-gray-800">{profile.name}</div>
                      )}
                    </div>

                    {/* Email - Read only */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="p-2 bg-gray-50 rounded-md text-gray-800">{profile.email}</div>
                    </div>

                    {/* Password */}
                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={profile.password}
                          onChange={(e) => setProfile({...profile, password: e.target.value})}
                          placeholder="Leave blank to keep current password"
                          className="w-full p-2 border rounded-md focus:ring-[#FF6B8B] focus:border-[#FF6B8B]"
                        />
                      </div>
                    )}
                  </div>
                  
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
                  {/* First badge */}
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="w-16 h-16 bg-[#FADADD] rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF6B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-800">First Steps</h4>
                    <p className="text-xs text-gray-500">Complete your first lesson</p>
                  </div>
                  
                  {/* Locked badge example */}
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
                </div>
              </>
            )}
            
            {activeTab === 'statistics' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Learning Statistics</h2>
                  <p className="text-gray-600">Track your learning progress over time</p>
                </div>
                
                {/* Learning Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#FF6B8B] mb-2">85%</div>
                    <div className="text-sm text-gray-600">Accuracy Rate</div>
                  </div>
                </div>
                
                {/* Weekly Activity */}
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Weekly Activity</h3>
                <div className="bg-white border rounded-lg p-4 mb-8">
                  <div className="flex justify-between items-end h-40 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                      <div key={day} className="flex flex-col items-center">
                        <div 
                          className="bg-[#FF6B8B] w-8 rounded-t-md" 
                          style={{ 
                            height: `${[30, 45, 20, 60, 75, 40, 15][i]}%`,
                            opacity: [0.7, 0.8, 0.6, 1, 0.9, 0.75, 0.5][i]
                          }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">{day}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Learning Focus */}
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Learning Focus</h3>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-medium text-gray-700 mb-2">Vocabulary Categories</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Greetings</span>
                            <span>85%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#FF6B8B] h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Food & Dining</span>
                            <span>65%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#FF6B8B] h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Travel</span>
                            <span>40%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#FF6B8B] h-2 rounded-full" style={{ width: '40%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-medium text-gray-700 mb-2">Skill Distribution</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Reading</span>
                            <span>70%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#FF6B8B] h-2 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Listening</span>
                            <span>55%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#FF6B8B] h-2 rounded-full" style={{ width: '55%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Speaking</span>
                            <span>30%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-[#FF6B8B] h-2 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
