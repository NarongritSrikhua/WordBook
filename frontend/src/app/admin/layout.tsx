import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/app/lib/auth';
import AdminSidebar from '@/app/components/admin-sidebar';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSession();

  // Check if user is admin
  if (!session || !isAdmin(session)) {
    redirect('/admin-login');
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




