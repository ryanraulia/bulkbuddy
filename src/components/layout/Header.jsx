// src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white py-4 shadow-lg">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          BulkBuddy
        </Link>
        <div className="space-x-6">
          <Link to="/" className="hover:text-blue-200 transition-colors">
            Home
          </Link>
          <Link to="/generate" className="hover:text-blue-200 transition-colors">
            Generate
          </Link>
          <Link to="/saved" className="hover:text-blue-200 transition-colors">
            Saved Plans
          </Link>
        </div>
      </nav>
    </header>
  );
}