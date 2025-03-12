// SubmitRecipeButton.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RecipeForm from '../forms/RecipeForm';

const SubmitRecipeButton = () => {
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated } = useAuth();

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
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        Submit Your Recipe
      </button>
      {showForm && <RecipeForm onClose={() => setShowForm(false)} />}
    </>
  );
};

export default SubmitRecipeButton;