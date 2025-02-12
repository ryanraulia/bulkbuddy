import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-yellow-500 text-white py-8 mt-auto shadow-2xl relative">
      <div className="absolute inset-0 bg-[url('/images/food-texture.png')] opacity-10"></div> {/* Subtle texture */}
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left relative z-10">
        {/* Left - Branding & Slogan */}
        <div>
          <h2 className="text-3xl font-extrabold text-yellow-400 flex items-center gap-2">
            Bulk<span className="text-white">Buddy</span>
          </h2>
          <p className="mt-2 text-gray-400 text-sm">Your personalized meal planning solution</p>
        </div>

        {/* Center - Navigation Links */}
        <div className="mt-4 md:mt-0 flex space-x-6 text-lg font-medium">
          <Link to="/" className="hover:text-yellow-300 transition duration-300 hover:scale-105">Home</Link>
          <Link to="/Calculators" className="hover:text-yellow-300 transition duration-300 hover:scale-105">Calculators</Link>
          <Link to="/Recipes" className="hover:text-yellow-300 transition duration-300 hover:scale-105">Recipes</Link>
          <Link to="/Tips" className="hover:text-yellow-300 transition duration-300 hover:scale-105">Tips</Link>
          <Link to="/Contact" className="hover:text-yellow-300 transition duration-300 hover:scale-105">Contact</Link>
        </div>

        {/* Right - Social Media Links */}
        <div className="mt-4 md:mt-0 flex space-x-4">
          <a href="#" className="text-gray-400 hover:text-yellow-400 transition duration-300 hover:scale-110">
            <FaFacebookF size={20} />
          </a>
          <a href="#" className="text-gray-400 hover:text-yellow-400 transition duration-300 hover:scale-110">
            <FaInstagram size={20} />
          </a>
          <a href="#" className="text-gray-400 hover:text-yellow-400 transition duration-300 hover:scale-110">
            <FaTwitter size={20} />
          </a>
          <a href="#" className="text-gray-400 hover:text-yellow-400 transition duration-300 hover:scale-110">
            <FaYoutube size={20} />
          </a>
        </div>
      </div>

      {/* Bottom - Copyright */}
      <div className="mt-6 text-center text-gray-500 text-sm relative z-10">
        &copy; {new Date().getFullYear()} BulkBuddy. All rights reserved.
      </div>
    </footer>
  );
}
