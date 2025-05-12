'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({ name: '', email: '', role: '' });
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in by looking for the auth cookie
        const checkLoginStatus = async () => {
            try {
                const response = await fetch('/api/auth/check', { credentials: 'include' });
                if (response.ok && response.status === 200) {
                    setIsLoggedIn(true);
                    // Get user data
                    const userData = await response.json();
                    setUser(userData.user || { name: 'User', email: '', role: '' });
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                setIsLoggedIn(false);
            }
        };
        
        checkLoginStatus();
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { 
                method: 'POST',
                credentials: 'include'
            });
            setIsLoggedIn(false);
            setUser({ name: '', email: '', role: '' });
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const isActivePath = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold text-[#ff6b8b]">Word Book</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link 
                            href="/" 
                            className={`${isActivePath('/') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                        >
                            Home
                        </Link>
                        <Link 
                            href="/flashcards" 
                            className={`${isActivePath('/flashcards') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                        >
                            Flashcards
                        </Link>
                        <Link 
                            href="/practice" 
                            className={`${isActivePath('/practice') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                        >
                            Practice
                        </Link>
                        {isLoggedIn ? (
                            <>
                                <Link 
                                    href="/dashboard" 
                                    className={`${isActivePath('/dashboard') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                                >
                                    Dashboard
                                </Link>
                                {user.role === 'admin' && (
                                    <Link 
                                        href="/admin/dashboard" 
                                        className={`${pathname.startsWith('/admin') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                                    >
                                        Admin
                                    </Link>
                                )}
                                <div className="relative ml-4">
                                    <button 
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center space-x-2 focus:outline-none"
                                    >
                                        <div className="w-8 h-8 bg-[#ff6b8b] rounded-full flex items-center justify-center text-white">
                                            {user.name ? user.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <span className="text-gray-700">{user.name}</span>
                                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                            <Link 
                                                href="/profile" 
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <Link 
                                                href="/settings" 
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                Settings
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link 
                                                    href="/admin/dashboard" 
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsProfileMenuOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/login" 
                                    className={`${isActivePath('/login') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                                >
                                    Login
                                </Link>
                                <Link 
                                    href="/signup" 
                                    className={`${isActivePath('/signup') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-[#ff6b8b] focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-2">
                        <div className="flex flex-col space-y-2 pb-3">
                            <Link 
                                href="/"
                                className={`block px-3 py-2 rounded-md ${isActivePath('/') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/flashcards"
                                className={`block px-3 py-2 rounded-md ${isActivePath('/flashcards') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Flashcards
                            </Link>
                            <Link 
                                href="/practice"
                                className={`block px-3 py-2 rounded-md ${isActivePath('/practice') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Practice
                            </Link>
                            {isLoggedIn ? (
                                <>
                                    <Link 
                                        href="/dashboard"
                                        className={`block px-3 py-2 rounded-md ${isActivePath('/dashboard') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link 
                                            href="/admin/dashboard"
                                            className={`block px-3 py-2 rounded-md ${pathname.startsWith('/admin') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <Link 
                                        href="/profile"
                                        className={`block px-3 py-2 rounded-md ${isActivePath('/profile') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <div className="px-3 py-2 flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-[#ff6b8b] rounded-full flex items-center justify-center text-white text-xs">
                                            {user.name ? user.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <span className="text-gray-700 text-sm">{user.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block px-3 py-2 rounded-md text-left text-gray-600"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        href="/login"
                                        className={`block px-3 py-2 rounded-md ${isActivePath('/login') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        href="/signup"
                                        className={`block px-3 py-2 rounded-md ${isActivePath('/signup') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                    {!isLoggedIn && (
                                        <Link 
                                            href="/admin-login"
                                            className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Admin Login
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
