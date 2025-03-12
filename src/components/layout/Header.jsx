import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUtensils, FaCalculator, FaEnvelope, FaBookOpen, FaLightbulb, FaUser, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import LoginButton from '../buttons/LoginButton';
import SignUpButton from '../buttons/SignUpButton';
import SubmitRecipeButton from '../buttons/SubmitRecipeButton';
import AuthModal from './AuthModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
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
    <header className={`py-4 shadow-lg sticky top-0 z-50 ${darkMode ? 'bg-[#1E1E1E] text-[#E0E0E0]' : 'bg-[#F8F9FA] text-[#212529]'}`} role="banner">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 transition-colors duration-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
            aria-label="BulkBuddy Home"
          >
            <FaUtensils className="text-[#007BFF]" aria-hidden="true" /> 
            <span className="text-[#007BFF]">Bulk</span>
            <span>Buddy</span>
          </Link>

          {/* Mobile menu button */}
          <button 
            className={`md:hidden ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#FAFAFA] hover:bg-[#F0F0F0]'} focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition-colors`}
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
                    className={`flex items-center gap-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-[#F0F0F0]'} rounded-lg px-3 py-2 transition-colors duration-200 ${darkMode ? 'text-white' : 'text-[#212529]'} hover:text-[#007BFF] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    role="menuitem"
                  >
                    <Icon className="text-[#007BFF] text-lg" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
              {user?.role === 'admin' && (
                <li role="none">
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 bg-[#007BFF] hover:bg-[#0056b3] rounded-lg px-3 py-2 transition-colors duration-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <SubmitRecipeButton className="bg-[#007BFF] hover:bg-[#0056b3] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/profile" 
                  className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#FAFAFA] hover:bg-[#F0F0F0]'} rounded-lg py-2 px-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label="View Profile"
                >
                  <div className="bg-[#007BFF] rounded-full p-1">
                    <FaUser className="text-white text-sm" aria-hidden="true" />
                  </div>
                  <span>{user.username || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#FAFAFA] hover:bg-[#F0F0F0]'} text-[#212529] font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#FAFAFA] hover:bg-[#F0F0F0]'} text-[#212529] font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                />
                <SignUpButton 
                  onClick={handleSignUpClick} 
                  className="bg-[#007BFF] hover:bg-[#0056b3] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="ml-4 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className={`md:hidden mt-4 pb-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col space-y-2" role="menu">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <li key={label} role="none">
                    <Link
                      to={to}
                      className={`flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-[#F0F0F0]'} rounded-lg p-3 transition-colors duration-200 ${darkMode ? 'text-white' : 'text-[#212529]'} hover:text-[#007BFF] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      role="menuitem"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="text-[#007BFF] text-xl" aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
                {user?.role === 'admin' && (
                  <li role="none">
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-3 bg-[#007BFF] hover:bg-[#0056b3] rounded-lg p-3 transition-colors duration-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      role="menuitem"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  </li>
                )}
                <div className="mt-4 space-y-3">
                  <SubmitRecipeButton 
                    className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  
                  {user ? (
                    <>
                      <Link 
                        to="/profile" 
                        className={`flex items-center justify-center gap-2 w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#FAFAFA] hover:bg-[#F0F0F0]'} rounded-lg py-2 px-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        aria-label="View Profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="bg-[#007BFF] rounded-full p-1">
                          <FaUser className="text-white text-sm" aria-hidden="true" />
                        </div>
                        <span>{user.username || 'Profile'}</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#FAFAFA] hover:bg-[#F0F0F0]'} text-[#212529] font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                        className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#FAFAFA] hover:bg-[#F0F0F0]'} text-[#212529] font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                      />
                      <SignUpButton 
                        onClick={handleSignUpClick} 
                        className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </>
                  )}
                </div>
              </ul>
            </nav>
          </div>
        )}
      </div>

      <AuthModal isOpen={isModalOpen} onClose={closeModal} showLogin={showLogin} />
    </header>
  );
}