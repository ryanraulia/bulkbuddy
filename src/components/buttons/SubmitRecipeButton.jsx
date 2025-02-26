// src/components/buttons/SubmitRecipeButton.jsx
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
        className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
      >
        Submit Your Recipe
      </button>
      {showForm && <RecipeForm onClose={() => setShowForm(false)} />}
    </>
  );
};

export default SubmitRecipeButton;