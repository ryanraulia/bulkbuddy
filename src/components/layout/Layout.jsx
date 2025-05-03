import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { ThemeProvider } from '../../context/ThemeContext'; 

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}