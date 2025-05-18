'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, loading: authLoading } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Clear previous errors
    setErrors({});
    
    // Log exact values for debugging
    console.log('Form values before submission:', {
      name: `"${name}"`,
      email: `"${email}"`,
      password: `"${password}"`,
      confirmPassword: `"${confirmPassword}"`,
      nameLength: name.length,
      emailLength: email.length,
      passwordLength: password.length,
    });
    
    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting to register with:', { 
        name: `"${name}"`, 
        email: `"${email}"`, 
        passwordLength: password.length 
      });
      
      // Trim values before sending to API
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      
      await register(trimmedName, trimmedEmail, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle validation errors from the backend
      if (err.message && typeof err.message === 'string' && err.message.includes(',')) {
        const validationErrors = err.message.split(',');
        const newErrors: Record<string, string> = {};
        
        console.log('Validation errors from backend:', validationErrors);
        
        validationErrors.forEach((error: string) => {
          if (error.includes('email')) {
            newErrors.email = 'Please enter a valid email address';
          } else if (error.includes('name')) {
            newErrors.name = 'Name is required';
          } else if (error.includes('password')) {
            newErrors.password = 'Password must be at least 6 characters';
          }
        });
        
        setErrors(newErrors);
      } else {
        // General error
        setErrors({ general: err.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {errors.general}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      
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
          className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
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
          className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md`}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={loading || authLoading}
        className="w-full bg-[#ff6b8b] text-white py-2 px-4 rounded-md hover:bg-[#ff4d73] transition duration-300 disabled:opacity-50"
      >
        {loading || authLoading ? 'Signing up...' : 'Sign Up'}
      </button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-[#ff6b8b] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}



