import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function SignUpButton({ onClick }) {
  const { darkMode } = useTheme();

  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 
        ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#2D2D2D] text-white' 
                   : 'bg-[#F0F0F0] hover:bg-[#F0F0F0] text-black'} 
        font-medium px-5 py-3 rounded-lg transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500`}
    >
      Sign Up
    </button>
  );
}
