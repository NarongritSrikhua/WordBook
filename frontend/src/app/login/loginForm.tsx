'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading: authLoading, isAuthenticated, user } = useAuth();

  // Get the callback URL from the query parameters
  const callbackUrl = searchParams?.get('callbackUrl') || '/';  // Changed from '/dashboard' to '/'

  // Check if user is already authenticated and redirect if needed
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already authenticated:', user);
      console.log('User role:', user.role);
      console.log('Is admin check:', user.role === 'admin');
      
      // Redirect based on user role
      if (user.role === 'admin') {
        console.log('Redirecting to admin dashboard via useEffect');
        router.push('/admin/dashboard');
      } else {
        console.log('Redirecting to:', callbackUrl);
        router.push(callbackUrl);
      }
    }
  }, [isAuthenticated, user, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting to login with:', { email });
      const user = await login(email, password);
      console.log('Login successful, user:', user);
      console.log('User role is:', user.role);
      
      // Redirect based on user role
      if (user.role === 'admin') {
        console.log('Redirecting to admin dashboard');
        router.push('/admin/dashboard');
      } else {
        console.log('Redirecting to:', callbackUrl || '/');
        router.push(callbackUrl || '/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              // Eye-off SVG
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 012.92-4.36m2.1-1.7A9.956 9.956 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.17 5.37M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            ) : (
              // Eye SVG
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <div className="mt-1 text-right">
          <Link href="/forgot-password" className="text-xs text-[#ff6b8b] hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading || authLoading}
        className="w-full bg-[#ff6b8b] text-white py-2 px-4 rounded-md hover:bg-[#ff4d73] transition duration-300 disabled:opacity-50"
      >
        {loading || authLoading ? 'Logging in...' : 'Log In'}
      </button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#ff6b8b] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}







