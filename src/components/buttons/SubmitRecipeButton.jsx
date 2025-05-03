import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import RecipeForm from '../forms/RecipeForm';

const SubmitRecipeButton = () => {
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const { darkMode } = useTheme();

  const handleClick = () => {
    if (!isAuthenticated) {
      alert('Please login to submit a recipe');
      return;
    }
    setShowForm(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 
          ${darkMode ? 'bg-[#1E1E1E] hover:bg-[#2D2D2D] text-white' 
                     : 'bg-[#F0F0F0] hover:bg-[#F0F0F0] text-black'} 
          font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 
          focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        Submit Your Recipe
      </button>
      {showForm && <RecipeForm onClose={() => setShowForm(false)} />}
    </>
  );
};

export default SubmitRecipeButton;
