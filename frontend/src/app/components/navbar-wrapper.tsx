'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Don't render navbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  return <Navbar />;
}