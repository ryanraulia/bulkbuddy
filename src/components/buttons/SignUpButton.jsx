import React from 'react';

export default function SignUpButton({ onClick }) {
  return (
    <button 
      onClick={onClick} 
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
    >
      Sign Up
    </button>
  );
}