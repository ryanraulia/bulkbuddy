import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUtensils, FaCalculator, FaEnvelope, FaBookOpen, FaLightbulb, FaUser, FaSignOutAlt } from 'react-icons/fa';
import LoginButton from '../buttons/LoginButton';
import SignUpButton from '../buttons/SignUpButton';
import SubmitRecipeButton from '../buttons/SubmitRecipeButton';
import AuthModal from './AuthModal';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginClick = () => {
    setShowLogin(true);
    setIsModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleSignUpClick = () => {
    setShowLogin(false);
    setIsModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { to: "/", icon: FaUtensils, label: "Home" },
    { to: "/calculators", icon: FaCalculator, label: "Calculators" },
    { to: "/recipes", icon: FaBookOpen, label: "Recipes" },
    { to: "/tips", icon: FaLightbulb, label: "Tips" },
    { to: "/contact", icon: FaEnvelope, label: "Contact" }
  ];

  return (
    <header className="bg-gray-900 text-white py-4 shadow-lg sticky top-0 z-50" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 transition-colors duration-200 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
            aria-label="BulkBuddy Home"
          >
            <FaUtensils className="text-blue-400" aria-hidden="true" /> 
            <span className="text-blue-300">Bulk</span>
            <span>Buddy</span>
          </Link>

          {/* Mobile menu button */}
          <button 
            className="md:hidden bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition-colors"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" aria-label="Main navigation">
            <ul className="flex items-center gap-1 lg:gap-2 font-medium" role="menubar">
              {navItems.map(({ to, icon: Icon, label }) => (
                <li key={label} role="none">
                  <Link
                    to={to}
                    className="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors duration-200 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    role="menuitem"
                  >
                    <Icon className="text-blue-400 text-lg" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
              {user?.role === 'admin' && (
                <li role="none">
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors duration-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    role="menuitem"
                  >
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <SubmitRecipeButton className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 px-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="View Profile"
                >
                  <div className="bg-blue-600 rounded-full p-1">
                    <FaUser className="text-white text-sm" aria-hidden="true" />
                  </div>
                  <span>{user.username || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Log out of your account"
                >
                  <FaSignOutAlt aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <LoginButton 
                  onClick={handleLoginClick} 
                  className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <SignUpButton 
                  onClick={handleSignUpClick} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden mt-4 pb-2">
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col space-y-2" role="menu">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <li key={label} role="none">
                    <Link
                      to={to}
                      className="flex items-center gap-3 hover:bg-gray-800 rounded-lg p-3 transition-colors duration-200 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      role="menuitem"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="text-blue-400 text-xl" aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
                {user?.role === 'admin' && (
                  <li role="none">
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 rounded-lg p-3 transition-colors duration-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      role="menuitem"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            
            <div className="mt-4 space-y-3">
              <SubmitRecipeButton 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-2 px-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="View Profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="bg-blue-600 rounded-full p-1">
                      <FaUser className="text-white text-sm" aria-hidden="true" />
                    </div>
                    <span>{user.username || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Log out of your account"
                  >
                    <FaSignOutAlt aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <LoginButton 
                    onClick={handleLoginClick} 
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <SignUpButton 
                    onClick={handleSignUpClick} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={isModalOpen} onClose={closeModal} showLogin={showLogin} />
    </header>
  );
}