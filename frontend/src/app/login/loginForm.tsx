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
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
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







