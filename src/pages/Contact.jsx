import React from 'react';
import ContactForm from "../components/contact/ContactForm.jsx";
import { useTheme } from '../context/ThemeContext';

export default function Contact() {
  const { darkMode } = useTheme();
  
  return (
    <div className={`min-h-screen py-12 ${darkMode ? 'bg-gradient-to-b from-[#1A1A1A] via-[#333333] to-[#1A1A1A]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-extrabold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>Contact Us</h1>
          <p className={`mt-4 text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            We're here to help with any questions about Bulk Buddy
          </p>
        </div>
        
        {/* Contact Form */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-8 rounded-lg shadow-lg border`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>Send Us a Message</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-8`}>
            Have questions? Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}