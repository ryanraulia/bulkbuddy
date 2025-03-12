import React from 'react';

export default function LoginButton({ onClick }) {
  return (
    <button 
      onClick={onClick} 
      className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      aria-label="Log in to your account"
    >
      Login
    </button>
  );
}