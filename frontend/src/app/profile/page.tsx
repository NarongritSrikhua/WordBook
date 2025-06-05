'use client';

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Profile {
  name: string;
  email: string;
  level: string;
  targetLanguage: string;
  dailyGoal: string;
  notifications: boolean;
  theme: string;
  soundEffects: boolean;
  password: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profile, setProfile] = useState<Profile>({
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
        const token = localStorage.getItem('token') || '';
        
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          credentials: 'include',
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error(errorData.message || `Failed to update profile (${response.status})`);
        }
      }
      
      // Save preferences to local storage
      localStorage.setItem('userPreferences', JSON.stringify(profileData));
      
      // Save preferences to backend
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
      }
      
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setProfile(prev => ({ ...prev, password: '' }));
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'An error occurred while updating your profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!user) {
      setPasswordError('You must be logged in to change your password');
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setPasswordError('Authentication token not found. Please try logging in again.');
        return;
      }

      console.log('Sending change password request:', {
        userId: user.id,
        hasToken: !!token,
        tokenLength: token.length
      });

      const response = await fetch(`/api/users/${user.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentPassword,
          newPassword 
        }),
      });

      const data = await response.json();
      console.log('Change password response:', {
        status: response.status,
        ok: response.ok,
        message: data.message
      });

      if (!response.ok) {
        if (response.status === 401) {
          setPasswordError('Current password is incorrect');
        } else {
          throw new Error(data.message || 'Failed to update password');
        }
        return;
      }

      setPasswordSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#FADADD] to-[#FF6B8B] rounded-t-2xl p-8 text-center relative overflow-hidden">
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
              {/* <button
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
              </button> */}
            </nav>
          </div>

          {/* Profile Content */}
          <div className="bg-white rounded-b-2xl p-6 shadow-lg">
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

                  {/* Password Change */}
                  {showPasswordForm ? (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-[#FF6B8B] focus:border-[#FF6B8B]"
                            placeholder="Enter your current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-[#FF6B8B] focus:border-[#FF6B8B]"
                            placeholder="Enter new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-[#FF6B8B] focus:border-[#FF6B8B]"
                            placeholder="Confirm new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      {passwordError && (
                        <div className="text-red-600 text-sm">{passwordError}</div>
                      )}
                      {passwordSuccess && (
                        <div className="text-green-600 text-sm">{passwordSuccess}</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-[#FF6B8B] text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                        >
                          Update Password
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelPasswordChange}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="text-[#FF6B8B] hover:text-pink-600"
                    >
                      Change Password
                    </button>
                  )}
                </div>
                
                <div className="space-y-6 mt-8">
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
                        <option>Korean</option>
                        <option>Chinese</option>
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
                        <option>2 hours</option>
                      </select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md text-gray-800">{profile.dailyGoal}</div>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Enable Notifications
                    </label>
                    {isEditing ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.notifications}
                          onChange={(e) => setProfile({...profile, notifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B8B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B8B]"></div>
                      </label>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md text-gray-800">
                        {profile.notifications ? 'Enabled' : 'Disabled'}
                      </div>
                    )}
                  </div>

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Enable Sound Effects
                    </label>
                    {isEditing ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.soundEffects}
                          onChange={(e) => setProfile({...profile, soundEffects: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF6B8B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B8B]"></div>
                      </label>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md text-gray-800">
                        {profile.soundEffects ? 'Enabled' : 'Disabled'}
                      </div>
                    )}
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
                <div className="bg-white border rounded-lg p-4">
                  <div className="h-48 flex items-end justify-between">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div key={day} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-[#FF6B8B] rounded-t"
                          style={{ height: `${Math.random() * 100}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1]}
                        </div>
                      </div>
                    ))}
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
