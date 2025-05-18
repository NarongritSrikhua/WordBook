import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
        <p className="text-gray-600 mb-6">
          You don't have sufficient permissions to access this page. This area is restricted to administrators only.
        </p>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/" 
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
          >
            Return to Home
          </Link>
          <Link 
            href="/login?callbackUrl=/admin/dashboard" 
            className="border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 text-center"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    </div>
  );
}