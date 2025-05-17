'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      // Redirect to admin login page after logout
      router.push('/admin-login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white shadow-md h-screen fixed transition-all duration-300 ease-in-out z-10`}>
      {/* Collapse toggle button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 focus:outline-none"
      >
        <svg className={`h-5 w-5 text-gray-500 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex-shrink-0 flex items-center">
          <span className={`text-2xl font-bold text-[#ff6b8b] ${isCollapsed ? 'hidden' : 'block'}`}>Word Book</span>
          {isCollapsed ? (
            <span className="text-2xl font-bold text-[#ff6b8b]">WB</span>
          ) : (
            <span className="ml-2 text-sm text-gray-500">Admin</span>
          )}
        </Link>
      </div>
      
      {/* User profile */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b8b] to-[#ff8e8b] rounded-full flex items-center justify-center text-white shadow-sm">
            {userName ? userName[0].toUpperCase() : 'A'}
          </div>
          {!isCollapsed && (
            <div>
              <div className="text-sm font-medium text-gray-900">{userName}</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-5 px-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        <Link 
          href="/admin/dashboard" 
          className={`group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors ${
            isActive('/admin/dashboard') 
              ? 'bg-pink-50 text-[#ff6b8b]' 
              : 'text-gray-700 hover:text-[#ff6b8b]'
          }`}
        >
          <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 ${
            isActive('/admin/dashboard') ? 'text-[#ff6b8b]' : 'text-gray-500 group-hover:text-[#ff6b8b]'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>
        
        <Link 
          href="/admin/users" 
          className={`mt-1 group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors ${
            isActive('/admin/users') 
              ? 'bg-pink-50 text-[#ff6b8b]' 
              : 'text-gray-700 hover:text-[#ff6b8b]'
          }`}
        >
          <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 ${
            isActive('/admin/users') ? 'text-[#ff6b8b]' : 'text-gray-500 group-hover:text-[#ff6b8b]'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {!isCollapsed && <span>Users</span>}
        </Link>
        
        <Link 
          href="/admin/content" 
          className={`mt-1 group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors ${
            isActive('/admin/content') 
              ? 'bg-pink-50 text-[#ff6b8b]' 
              : 'text-gray-700 hover:text-[#ff6b8b]'
          }`}
        >
          <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 ${
            isActive('/admin/content') ? 'text-[#ff6b8b]' : 'text-gray-500 group-hover:text-[#ff6b8b]'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {!isCollapsed && <span>Content</span>}
        </Link>
        
        <Link 
          href="/admin/settings" 
          className={`mt-1 group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors ${
            isActive('/admin/settings') 
              ? 'bg-pink-50 text-[#ff6b8b]' 
              : 'text-gray-700 hover:text-[#ff6b8b]'
          }`}
        >
          <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 ${
            isActive('/admin/settings') ? 'text-[#ff6b8b]' : 'text-gray-500 group-hover:text-[#ff6b8b]'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!isCollapsed && <span>Settings</span>}
        </Link>
        
        <div className="pt-5 mt-5 border-t border-gray-200">
          <Link 
            href="/" 
            className={`group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors text-gray-700 hover:text-[#ff6b8b]`}
          >
            <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 text-gray-500 group-hover:text-[#ff6b8b]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            {!isCollapsed && <span>Back to Site</span>}
          </Link>
          
          <button 
            onClick={handleLogout}
            className={`mt-1 w-full text-left group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors text-gray-700 hover:text-[#ff6b8b]`}
          >
            <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 text-gray-500 group-hover:text-[#ff6b8b]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}



