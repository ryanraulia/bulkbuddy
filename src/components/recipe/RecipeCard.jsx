// src/components/recipe/RecipeCard.jsx
import React from 'react';

const RecipeCard = ({ recipe }) => {
  return (
    <div key={recipe.id} className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition">
      <img src={recipe.image} alt={recipe.name} className="w-full h-40 object-cover rounded-md" />
      <h2 className="text-lg font-semibold mt-2 text-center">{recipe.name}</h2>
    </div>
  );
};

export default RecipeCard;
