'use client';

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>
          {user && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Hello, {user.name}</h2>
              <p className="text-gray-600">
                This is your personal dashboard. Here you can manage your account and access your content.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
