'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [practiceSubmenuOpen, setPracticeSubmenuOpen] = useState(false);
  const { logout } = useAuth(); // Use the logout function from AuthContext

  const handleLogout = async () => {
    try {
      await logout(); // Use the centralized logout function
      
      // Redirect to login page after logout
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Helper function to determine if a submenu should be open
  const isPracticeActive = () => {
    return pathname.startsWith('/admin/practice');
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
      <div className="p-4 flex items-center justify-between">
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
      <div className="p-4">
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
          href="/admin/flashcards" 
          className={`mt-1 group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors ${
            isActive('/admin/flashcards') 
              ? 'bg-pink-50 text-[#ff6b8b]' 
              : 'text-gray-700 hover:text-[#ff6b8b]'
          }`}
        >
          <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 ${
            isActive('/admin/flashcards') ? 'text-[#ff6b8b]' : 'text-gray-500 group-hover:text-[#ff6b8b]'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {!isCollapsed && <span>Flashcards</span>}
        </Link>

        {/* Practice section with submenu */}
        <div className="mt-1">
          <button
            onClick={() => !isCollapsed && setPracticeSubmenuOpen(!practiceSubmenuOpen)}
            className={`w-full group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors ${
              isPracticeActive() 
                ? 'bg-pink-50 text-[#ff6b8b]' 
                : 'text-gray-700 hover:text-[#ff6b8b]'
            }`}
          >
            <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 ${
              isPracticeActive() ? 'text-[#ff6b8b]' : 'text-gray-500 group-hover:text-[#ff6b8b]'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {!isCollapsed && (
              <div className="flex justify-between items-center w-full">
                <span>Practice</span>
                <svg 
                  className={`h-4 w-4 transition-transform ${practiceSubmenuOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </button>

          {/* Submenu for Practice */}
          {!isCollapsed && practiceSubmenuOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <Link 
                href="/admin/practice" 
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/practice') && !isActive('/admin/practice/sets') && !isActive('/admin/practice/create')
                    ? 'bg-pink-50 text-[#ff6b8b]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#ff6b8b]'
                }`}
              >
                Questions
              </Link>
              <Link 
                href="/admin/practice/sets" 
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/practice/sets') 
                    ? 'bg-pink-50 text-[#ff6b8b]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#ff6b8b]'
                }`}
              >
                Practice Sets
              </Link>
              {/* <Link 
                href="/admin/practice/create" 
                className={`block px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/practice/create') 
                    ? 'bg-pink-50 text-[#ff6b8b]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#ff6b8b]'
                }`}
              >
                Create Set
              </Link> */}
            </div>
          )}

          {/* For collapsed mode, just show the icon */}
          {isCollapsed && (
            <Link 
              href="/admin/practice" 
              className={`mt-1 group flex items-center justify-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors ${
                isPracticeActive() 
                  ? 'bg-pink-50 text-[#ff6b8b]' 
                  : 'text-gray-700 hover:text-[#ff6b8b]'
              }`}
            >
              <svg className={`h-6 w-6 ${
                isPracticeActive() ? 'text-[#ff6b8b]' : 'text-gray-500 group-hover:text-[#ff6b8b]'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </Link>
          )}
        </div>

        <Link 
          href="/admin/categories" 
          className={`mt-1 group flex items-center px-2 py-3 text-base font-medium rounded-md hover:bg-gray-50 transition-colors ${
            isActive('/admin/categories') 
              ? 'bg-pink-50 text-[#ff6b8b]' 
              : 'text-gray-700 hover:text-[#ff6b8b]'
          }`}
        >
          <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 ${
            isActive('/admin/categories') ? 'text-[#ff6b8b]' : 'text-gray-500 group-hover:text-[#ff6b8b]'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {!isCollapsed && <span>Categories</span>}
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



