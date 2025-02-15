// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaCalculator, FaEnvelope, FaBookOpen, FaLightbulb } from 'react-icons/fa';
import LoginButton from '../buttons/LoginButton';
import SignUpButton from '../buttons/SignUpButton';
import SubmitRecipeButton from '../buttons/SubmitRecipeButton';
import AuthModal from './AuthModal';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  const handleLoginClick = () => {
    setShowLogin(true);
    setIsModalOpen(true);
  };

  const handleSignUpClick = () => {
    setShowLogin(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-yellow-500 text-white py-5 shadow-2xl relative">
      <div className="absolute inset-0 bg-[url('/images/food-texture.png')] opacity-10"></div>
      <nav className="container mx-auto px-6 flex justify-between items-center relative z-10">
        <Link 
          to="/" 
          className="text-4xl font-extrabold tracking-wide text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center gap-2"
        >
          <FaUtensils className="text-yellow-500" /> Bulk<span className="text-white">Buddy</span>
        </Link>

        <div className="flex items-center space-x-12">
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

          <div className="flex space-x-5">
            <SubmitRecipeButton />
            <LoginButton onClick={handleLoginClick} />
            <SignUpButton onClick={handleSignUpClick} />
          </div>
        </div>
      </nav>
      <AuthModal isOpen={isModalOpen} onClose={closeModal} showLogin={showLogin} />
    </header>
  );
}