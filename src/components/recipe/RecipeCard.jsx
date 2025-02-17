import React from 'react';

const RecipeCard = ({ recipe, onClick }) => {
  return (
    <div 
      className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 cursor-pointer"
      onClick={() => onClick(recipe.id)}
    >
      <img 
        src={recipe.image} 
        alt={recipe.title} 
        className="w-full h-40 object-cover rounded-md"
      />
      <h2 className="text-lg font-semibold mt-2 text-center text-yellow-400">
        {recipe.title}
      </h2>
    </div>
  );
};

export default RecipeCard;