import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Word Book - Your Vocabulary Learning Companion",
  description: "Learn and improve your vocabulary with Word Book's interactive learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-[64px]">{children}</main>
        {/* <footer className="bg-[#FADADD] mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-gray-800">
            <p>© 2024 Word Book. All rights reserved.</p>
          </div>
        </footer> */}
      </body>
    </html>
  );
}

