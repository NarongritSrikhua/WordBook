import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import NavbarWrapper from './components/navbar-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WordBook - Learn Languages with Flashcards',
  description: 'Improve your vocabulary with our spaced repetition flashcard system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
