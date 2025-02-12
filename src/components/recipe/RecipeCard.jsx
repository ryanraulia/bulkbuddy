import React from 'react';

const RecipeCard = ({ recipe }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
      <img src={recipe.image} alt={recipe.name} className="w-full h-40 object-cover rounded-md" />
      <h2 className="text-lg font-semibold mt-2 text-center text-yellow-400">{recipe.name}</h2>
    </div>
  );
};

export default RecipeCard;
