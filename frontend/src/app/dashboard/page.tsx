import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>
        <p className="text-lg mb-8">Hello, {session.name}!</p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Words Learned</h3>
              <p className="text-2xl font-bold">42</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Practice Sessions</h3>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Streak</h3>
              <p className="text-2xl font-bold">5 days</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="border-b pb-3">
              <p className="font-medium">Completed Flashcard Set: Basic Verbs</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">Added 5 new words to your collection</p>
              <p className="text-sm text-gray-500">Yesterday</p>
            </div>
            <div>
              <p className="font-medium">Completed Practice Session</p>
              <p className="text-sm text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
