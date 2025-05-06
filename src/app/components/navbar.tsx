'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

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
                    <div className="hidden md:flex space-x-8">
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
                        {/* <Link 
                            href="/book" 
                            className={`${isActivePath('/book') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                        >
                            Book
                        </Link> */}
                        <Link 
                            href="/practice" 
                            className={`${isActivePath('/practice') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                        >
                            Practice
                        </Link>
                        <Link 
                            href="/profile" 
                            className={`${isActivePath('/profile') ? 'text-[#ff6b8b]' : 'text-gray-600'} hover:text-[#ff6b8b] transition-colors`}
                        >
                            Profile
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
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
                            {/* <Link 
                                href="/book"
                                className={`block px-3 py-2 rounded-md ${isActivePath('/book') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Book
                            </Link> */}
                            <Link 
                                href="/practice"
                                className={`block px-3 py-2 rounded-md ${isActivePath('/practice') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Practice
                            </Link>
                            <Link 
                                href="/profile"
                                className={`block px-3 py-2 rounded-md ${isActivePath('/profile') ? 'bg-[#ff6b8b] text-white' : 'text-gray-600'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Profile
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
