import { redirect } from 'next/navigation';
import { getServerSession } from '@/app/lib/server-auth';
import AdminSidebar from '@/app/components/admin-sidebar';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Get session from server-side
  const session = await getServerSession();
  
  console.log('Admin layout - Session check:', session); // Debug log
  
  // Check if user is authenticated
  if (!session) {
    console.log('Redirecting to login - No valid session'); // Debug log
    redirect('/login?callbackUrl=/admin/dashboard');
  }
  
  // Check if user has admin role
  if (session.role !== 'admin') {
    console.log('Redirecting to unauthorized - User is not an admin'); // Debug log
    console.log('User role is:', session.role); // Debug log
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar userName={session.name} />

        {/* Main Content - with responsive margin */}
        <main className="flex-1 ml-20 md:ml-64 p-6 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
}




