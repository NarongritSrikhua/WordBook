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
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar userName={session.name} />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


