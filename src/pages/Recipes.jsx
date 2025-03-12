import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeModal from "../components/recipe/RecipeModal";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Plus, ChefHat, Bookmark } from 'lucide-react';

export default function Recipes() {
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('popular');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();

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

  const handleAddRecipe = () => {
    navigate('/add-recipe');
  };

  // Get all unique categories from both recipe arrays
  const allCategories = [...new Set([
    ...randomRecipes.map(recipe => recipe.category || 'Uncategorized'),
    ...userRecipes.map(recipe => recipe.category || 'Uncategorized')
  ])];

  // Filter recipes based on active category
  const filteredRandomRecipes = filterCategory === 'all' 
    ? randomRecipes 
    : randomRecipes.filter(recipe => recipe.category === filterCategory);
  
  const filteredUserRecipes = filterCategory === 'all' 
    ? userRecipes 
    : userRecipes.filter(recipe => recipe.category === filterCategory);

  const displayedRecipes = activeTab === 'popular' ? filteredRandomRecipes : filteredUserRecipes;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Hero Section */}
      <div className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-yellow-400 to-amber-500'} mb-8`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className={`text-5xl font-bold mb-4 ${darkMode ? 'text-yellow-400' : 'text-white'}`}>
              Discover Delicious Recipes
            </h1>
            <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-white opacity-90'}`}>
              Find your next culinary adventure from our collection of tasty recipes
            </p>
            
            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white dark:bg-gray-700 rounded-full overflow-hidden shadow-lg">
                <div className="pl-4">
                  <Search className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for recipes, ingredients, or cuisines..."
                  className={`w-full p-4 border-none focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                />
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-4 transition-colors focus:outline-none"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('popular')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'popular' 
                  ? 'bg-yellow-500 text-white' 
                  : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`
              }`}
            >
              <ChefHat size={18} />
              <span>Popular</span>
            </button>
            <button 
              onClick={() => setActiveTab('user')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'user' 
                  ? 'bg-yellow-500 text-white' 
                  : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`
              }`}
            >
              <Bookmark size={18} />
              <span>User Recipes</span>
            </button>
          </div>
          
          {user && (
            <button 
              onClick={handleAddRecipe}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span>Add Recipe</span>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 whitespace-nowrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-full text-sm ${
                filterCategory === 'all'
                  ? 'bg-yellow-500 text-white' 
                  : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`
              }`}
            >
              All Categories
            </button>
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  filterCategory === category
                    ? 'bg-yellow-500 text-white' 
                    : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-t-4 border-yellow-500 border-solid rounded-full animate-spin"></div>
              <ChefHat className="w-8 h-8 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="ml-4 text-lg">Preparing recipes...</p>
          </div>
        )}

        {/* Recipe Section */}
        {!loading && (
          <>
            <h2 className="text-3xl font-bold mb-6">
              {activeTab === 'popular' ? 'Popular Recipes' : 'User Submitted Recipes'}
              {filterCategory !== 'all' && ` • ${filterCategory}`}
            </h2>
            
            {displayedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe}
                    user={user}
                    onClick={setSelectedRecipe}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
                <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium mb-2">No recipes found</h3>
                <p className="text-gray-500 mb-6">
                  {filterCategory !== 'all' 
                    ? `No ${filterCategory} recipes found in the ${activeTab === 'popular' ? 'popular' : 'user'} section.`
                    : `No recipes found in the ${activeTab === 'popular' ? 'popular' : 'user'} section.`}
                </p>
                {user && (
                  <button 
                    onClick={handleAddRecipe}
                    className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    <span>Add a Recipe</span>
                  </button>
                )}
              </div>
            )}
          </>
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