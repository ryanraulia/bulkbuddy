// src/assets/components/buttons/LoginButton.jsx
import React from 'react';

export default function LoginButton({ onClick }) {
  return (
    <button 
      onClick={onClick} 
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-5 py-3 rounded-lg transition-colors duration-200"
    >
      Login
    </button>
  );
}