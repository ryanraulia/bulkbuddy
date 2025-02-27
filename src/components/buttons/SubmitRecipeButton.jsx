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
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Submit Your Recipe
      </button>
      {showForm && <RecipeForm onClose={() => setShowForm(false)} />}
    </>
  );
};

export default SubmitRecipeButton;