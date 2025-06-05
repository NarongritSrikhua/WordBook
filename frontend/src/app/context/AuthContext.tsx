'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientSession, setSession, clearSession, Session } from '../lib/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => ({ id: '', name: '', email: '', role: '' }),
  register: async () => ({ id: '', name: '', email: '', role: '' }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        console.log('[AuthContext] Auth check response:', data);
        
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error checking authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to login');
      }

      const data = await response.json();
      
      // Log the user data to debug
      console.log('Login response data:', data);
      console.log('User role from login:', data.user.role);
      
      // Store the token in localStorage
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      // Set the user in state
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Return the user
      return data.user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register');
      }

      const data = await response.json();
      
      // Log the user data to debug
      console.log('Register response data:', data);
      
      // Set the user in state
      setUser(data);
      setIsAuthenticated(true);
      
      // Return the user
      return data;
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear client-side cookies and state
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      
      // Force a page refresh to clear any cached state
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('token');
        
        // Remove any cookies
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if the API call fails, clear local state
      clearSession();
      setUser(null);
      setIsAuthenticated(false);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('token');
        
        // Remove any cookies
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
