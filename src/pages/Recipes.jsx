import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeModal from "../components/recipe/RecipeModal";
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function Recipes() {
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from AuthContext

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const [randomResponse, userResponse] = await Promise.all([
          axios.get('/api/recipes/random'),
          axios.get('/api/recipes/user')
        ]);
        setRandomRecipes(randomResponse.data);
        setUserRecipes(userResponse.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleDelete = (deletedId) => {
    setUserRecipes(prev => prev.filter(r => r.id !== deletedId));
    setRandomRecipes(prev => prev.filter(r => r.id !== deletedId));
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen py-8 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-8">Recipes</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              type="submit"
              className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          </div>
        )}

        {/* Random Recipes Section */}
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">Popular Recipes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {randomRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe}
              user={user} // Pass user to RecipeCard
              onClick={setSelectedRecipe}
              onDelete={handleDelete} // Pass handleDelete to RecipeCard
            />
          ))}
        </div>

        {/* User Recipes Section */}
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">User Submitted Recipes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe}
              user={user} // Pass user to RecipeCard
              onClick={setSelectedRecipe}
              onDelete={handleDelete} // Pass handleDelete to RecipeCard
            />
          ))}
        </div>

        {/* No Results */}
        {!loading && randomRecipes.length === 0 && userRecipes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No recipes found. Try a different search.
          </div>
        )}

        {/* Recipe Modal */}
        {selectedRecipe && (
          <RecipeModal 
            recipeId={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
          />
        )}
      </div>
    </div>
  );
}