import React from 'react';
import ContactForm from "../components/contact/ContactForm.jsx";
import { useTheme } from '../context/ThemeContext';

export default function Contact() {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gradient-to-b from-[#121212] via-[#181818] to-[#121212]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-8 rounded-lg shadow-xl border-4`}>
          <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-6">Contact Us</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-center mb-8`}>
            Welcome to Bulk Buddy. If you have any questions or comments, feel free to reach out to us!
          </p>

          {/* ContactForm */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}