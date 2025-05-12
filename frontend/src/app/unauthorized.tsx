import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">401 - Unauthorized</h1>
      <p className="mb-6">Please log in to access this page.</p>
      <Link 
        href="/login" 
        className="inline-block bg-[#ff6b8b] text-white px-6 py-2 rounded-md hover:bg-[#ff5277] transition-colors"
      >
        Go to Login
      </Link>
    </main>
  );
}