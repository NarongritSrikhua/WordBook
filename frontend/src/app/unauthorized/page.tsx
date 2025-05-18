import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please log in with an account that has the required permissions.
        </p>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/login" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700"
          >
            Back to Login
          </Link>
          <Link 
            href="/" 
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded text-center hover:bg-gray-50"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}





