// src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import LoginButton from '../buttons/LoginButton';
import SignUpButton from '../buttons/SignUpButton';
import SubmitRecipeButton from '../buttons/SubmitRecipeButton';

export default function Header() {
  return (
    <header className="bg-gray-600 text-white py-4 shadow-lg">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        {/* Left side - Logo */}
        <Link to="/" className="text-2xl font-bold">
          BulkBuddy
        </Link>

        {/* Right side - Navigation and buttons */}
        <div className="flex items-center space-x-8">
          {/* Navigation Links */}
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link to="/Calculators" className="hover:text-blue-200 transition-colors">
              Calculators
            </Link>
            <Link to="/Contact" className="hover:text-blue-200 transition-colors">
              Contact
            </Link>
            <Link to="/Recipes" className="hover:text-blue-200 transition-colors">
              Recipes
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <SubmitRecipeButton />
            <LoginButton />
            <SignUpButton />
          </div>
        </div>
      </nav>
    </header>
  );
}