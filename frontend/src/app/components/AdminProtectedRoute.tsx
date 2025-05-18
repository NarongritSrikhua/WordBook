'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      console.log('Not authenticated, redirecting to login');
      router.replace('/login');
    } else if (!loading && isAuthenticated && user && user.role !== 'admin') {
      console.log('Not admin, redirecting to unauthorized');
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b8b]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}