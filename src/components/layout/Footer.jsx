import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaUtensils } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
  const { darkMode } = useTheme();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/calculators", label: "Calculators" },
    { to: "/recipes", label: "Recipes" },
    { to: "/tips", label: "Tips" },
    { to: "/contact", label: "Contact" }
  ];

  const socialLinks = [
    { icon: FaFacebookF, label: "Facebook" },
    { icon: FaInstagram, label: "Instagram" },
    { icon: FaTwitter, label: "Twitter" },
    { icon: FaYoutube, label: "YouTube" }
  ];

  return (
    <footer className={`${darkMode ? 'bg-[#202124] border-gray-700' : 'bg-[#FAFAFA] border-blue-500'} border-t py-8 mt-auto`} role="contentinfo">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center md:items-start">
            <Link 
              to="/" 
              className={`text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 transition-colors duration-200 ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2`}
              aria-label="BulkBuddy Home"
            >
              <FaUtensils className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" /> 
              <span className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Bulk</span>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Buddy</span>
            </Link>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your personalized meal planning solution
            </p>
            
            {/* Social links for mobile */}
            <div className="flex space-x-3 mt-4 md:hidden" role="list" aria-label="Social media links">
              {socialLinks.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-200 hover:text-white transition-colors duration-200 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={`Visit our ${label} page`}
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Quick Links</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {navItems.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'} hover:translate-x-1 inline-flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1`}
                    >
                      <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`}>›</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Connect section */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Connect With Us</h3>
            
            {/* Newsletter form */}
            <div className="w-full max-w-xs">
              <form className="flex flex-col space-y-2">
                <label htmlFor="email-subscription" className="sr-only">Sign up for our newsletter</label>
                <input
                  id="email-subscription"
                  type="email"
                  placeholder="Your email address"
                  className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-gray-900 placeholder-gray-400 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social links for desktop */}
            <div className="hidden md:flex space-x-3 mt-6" role="list" aria-label="Social media links">
              {socialLinks.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-200 hover:text-white transition-colors duration-200 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={`Visit our ${label} page`}
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'} my-4`}></div>

        {/* Copyright and legal links */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} BulkBuddy. All rights reserved.</p>
          
          <div className="mt-4 md:mt-0 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className={`${darkMode ? 'hover:text-blue-300' : 'hover:text-blue-600'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1`}>
              Privacy Policy
            </Link>
            <Link to="/terms" className={`${darkMode ? 'hover:text-blue-300' : 'hover:text-blue-600'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1`}>
              Terms of Service
            </Link>
            <Link to="/cookies" className={`${darkMode ? 'hover:text-blue-300' : 'hover:text-blue-600'} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1`}>
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}