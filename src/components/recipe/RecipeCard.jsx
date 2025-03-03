import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Correct the import path
import axios from 'axios';

const RecipeCard = ({ recipe, onClick, onDelete }) => {
  const { user } = useAuth();
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this recipe?')) {
      try {
        await axios.delete(`/api/recipes/${recipe.id}`, { withCredentials: true });
        onDelete(recipe.id);
      } catch (err) {
        console.error('Delete failed:', err.response?.data?.error || err.message);
      }
    }
  };

  const showDelete = user && recipe.source === 'user' && (
    user.role === 'admin' || user.id === recipe.user_id
  );

  return (
    <div className="relative bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 cursor-pointer">
      {showDelete && (
        <button 
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
          aria-label="Delete recipe"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      <img 
        src={recipe.image} 
        alt={recipe.title} 
        className="w-full h-40 object-cover rounded-md"
        onClick={() => onClick(recipe.id)}
      />
      <h2 className="text-lg font-semibold mt-2 text-center text-yellow-400">
        {recipe.title}
      </h2>
      <p className="text-sm text-gray-400 text-center mt-1">
        Submitted by: {recipe.username}
      </p>
    </div>
  );
};

export default RecipeCard;