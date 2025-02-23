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
    <header className="bg-slate-900 border-b-2 border-amber-500 text-white py-5 shadow-lg" role="banner">
      <nav className="container mx-auto px-6 flex justify-between items-center" aria-label="Main navigation">
        <Link 
          to="/" 
          className="text-4xl font-extrabold tracking-wide text-amber-400 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg transition duration-300 flex items-center gap-2"
          aria-label="BulkBuddy Home"
        >
          <FaUtensils className="text-amber-400" aria-hidden="true" /> 
          Bulk<span className="text-white">Buddy</span>
        </Link>

        <div className="flex items-center space-x-12">
          <div className="flex space-x-8 text-lg font-semibold" role="menubar">
            {[
              { to: "/", icon: FaUtensils, label: "Home" },
              { to: "/calculators", icon: FaCalculator, label: "Calculators" },
              { to: "/recipes", icon: FaBookOpen, label: "Recipes" },
              { to: "/tips", icon: FaLightbulb, label: "Tips" },
              { to: "/contact", icon: FaEnvelope, label: "Contact" }
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-2 text-white hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-2 transition duration-300"
                role="menuitem"
              >
                <Icon className="text-amber-400" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex space-x-5">
            <SubmitRecipeButton />
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-2 transition duration-300"
                  aria-label="View Profile"
                >
                  <div className="bg-amber-500 rounded-full p-2">
                    <FaUser className="text-white text-lg" aria-hidden="true" />
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
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