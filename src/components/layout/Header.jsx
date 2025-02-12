import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaCalculator, FaEnvelope, FaBookOpen, FaLightbulb } from 'react-icons/fa';
import LoginButton from '../buttons/LoginButton';
import SignUpButton from '../buttons/SignUpButton';
import SubmitRecipeButton from '../buttons/SubmitRecipeButton';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-yellow-500 text-white py-5 shadow-2xl relative">
      <div className="absolute inset-0 bg-[url('/images/food-texture.png')] opacity-10"></div> {/* Subtle food texture */}
      <nav className="container mx-auto px-6 flex justify-between items-center relative z-10">
        {/* Left side - Logo */}
        <Link 
          to="/" 
          className="text-4xl font-extrabold tracking-wide text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center gap-2"
        >
          <FaUtensils className="text-yellow-500" /> Bulk<span className="text-white">Buddy</span>
        </Link>

        {/* Right side - Navigation and buttons */}
        <div className="flex items-center space-x-12">
          {/* Navigation Links */}
          <div className="flex space-x-8 text-lg font-semibold">
            <Link to="/" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaUtensils className="text-yellow-400" /> Home
            </Link>
            <Link to="/Calculators" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaCalculator className="text-yellow-400" /> Calculators
            </Link>
            <Link to="/Recipes" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaBookOpen className="text-yellow-400" /> Recipes
            </Link>
            <Link to="/Tips" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaLightbulb className="text-yellow-400" /> Tips
            </Link>
            <Link to="/Contact" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaEnvelope className="text-yellow-400" /> Contact
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-5">
            <SubmitRecipeButton />
            <LoginButton />
            <SignUpButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
