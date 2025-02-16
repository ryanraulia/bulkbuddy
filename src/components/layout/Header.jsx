import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUtensils, FaCalculator, FaEnvelope, FaBookOpen, FaLightbulb, FaUser } from 'react-icons/fa';
import LoginButton from '../buttons/LoginButton';
import SignUpButton from '../buttons/SignUpButton';
import SubmitRecipeButton from '../buttons/SubmitRecipeButton';
import AuthModal from './AuthModal';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, []);

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
    // Refresh auth state after modal closes
    checkAuth();
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
            <Link to="/calculators" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaCalculator className="text-yellow-400" /> Calculators
            </Link>
            <Link to="/recipes" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaBookOpen className="text-yellow-400" /> Recipes
            </Link>
            <Link to="/tips" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaLightbulb className="text-yellow-400" /> Tips
            </Link>
            <Link to="/contact" className="flex items-center gap-2 hover:text-yellow-300 transition duration-300 hover:scale-105">
              <FaEnvelope className="text-yellow-400" /> Contact
            </Link>
          </div>

          <div className="flex space-x-5">
            <SubmitRecipeButton />
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 hover:text-yellow-300 transition duration-300"
                >
                  <div className="bg-yellow-500 rounded-full p-2">
                    <FaUser className="text-white text-lg" />
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <LoginButton onClick={handleLoginClick} />
                <SignUpButton onClick={handleSignUpClick} />
              </>
            )}
          </div>
        </div>
      </nav>
      <AuthModal isOpen={isModalOpen} onClose={closeModal} showLogin={showLogin} />
    </header>
  );
}