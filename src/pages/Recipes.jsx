import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeModal from "../components/recipe/RecipeModal";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Plus, ChefHat, Bookmark, Filter, X, Clock, Flame, Tag } from 'lucide-react';

export default function Recipes() {
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('popular');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    diet: '',
    cuisine: '',
    intolerances: [],
    type: '',
    maxReadyTime: '',
    minCalories: '',
    maxCalories: '',
    minProtein: '',
    maxProtein: '',
    minCarbs: '',
    maxCarbs: '',
    minFat: '',
    maxFat: ''
  });
  const [includeUserRecipes, setIncludeUserRecipes] = useState(true);
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
    const params = new URLSearchParams({
      q: searchQuery,
      includeUser: includeUserRecipes,
      ...Object.fromEntries(
        Object.entries(filters)
          .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
    });
    navigate(`/search?${params.toString()}`);
  };

  const handleDelete = (deletedId) => {
    setUserRecipes(prev => prev.filter(r => r.id !== deletedId));
    setRandomRecipes(prev => prev.filter(r => r.id !== deletedId));
  };

  const handleAddRecipe = () => {
    navigate('/add-recipe');
  };

  const clearFilters = () => {
    setFilters({
      diet: '',
      cuisine: '',
      intolerances: [],
      type: '',
      maxReadyTime: '',
      minCalories: '',
      maxCalories: '',
      minProtein: '',
      maxProtein: '',
      minCarbs: '',
      maxCarbs: '',
      minFat: '',
      maxFat: ''
    });
    setFilterCategory('all');
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
  
  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && value !== null && value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length + (filterCategory !== 'all' ? 1 : 0);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section with parallax effect */}
      <div className={`relative py-16 ${darkMode ? 'bg-gray-800' : ''} mb-8 overflow-hidden`}>
        {!darkMode && (
          <div className="absolute inset-0 bg-cover bg-center opacity-20" 
               style={{backgroundImage: "url('/images/food-pattern.jpg')"}}></div>
        )}
        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-r from-blue-900/70 to-indigo-900/70' : 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90'}`}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 z-10">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">
              Discover Delicious Recipes
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Find your next culinary adventure from our collection of tasty recipes
            </p>
            
            {/* Enhanced Search Bar with animated focus */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto transition-all duration-300">
              <div className={`flex items-center ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-full overflow-hidden shadow-lg border-2 ${darkMode ? 'border-blue-500/50 hover:border-blue-400' : 'border-transparent hover:border-blue-200'} transition-all duration-300`}>
                <div className="pl-6">
                  <Search className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes or ingredients..."
                  className={`w-full p-5 border-none focus:outline-none ${darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-500'}`}
                />
                <button
                  type="button" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} px-4 focus:outline-none relative`}
                >
                  <Filter size={20} />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  type="submit"
                  className={`${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium px-8 py-5 transition-colors focus:outline-none`}
                >
                  Search
                </button>
              </div>

              {/* Include User Recipes Toggle with improved styling */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-sm text-white font-medium">
                  Include User Recipes
                </span>
                <button
                  type="button"
                  onClick={() => setIncludeUserRecipes(!includeUserRecipes)}
                  className={`relative rounded-full w-14 h-7 transition-colors duration-300 ${
                    includeUserRecipes 
                      ? 'bg-green-500' 
                      : `${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`
                  }`}
                >
                  <span 
                    className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transform transition-transform duration-300 shadow-md ${
                      includeUserRecipes ? 'translate-x-7' : 'translate-x-0'
                    }`} 
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showFilters && (
  <div className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} max-w-7xl mx-auto px-6 py-6 rounded-xl shadow-lg mb-8 transition-all duration-300 transform`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Filter size={18} />
        Advanced Filters
      </h3>
      <div className="flex gap-3">
        <button
          onClick={clearFilters}
          className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors`}
        >
          <X size={14} />
          Clear All
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} p-2 rounded-lg flex items-center transition-colors`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Diet Type
        </label>
        <select
          value={filters.diet}
          onChange={(e) => setFilters({...filters, diet: e.target.value})}
          className={`w-full px-4 py-3 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors`}
        >
          <option value="">All Diets</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="glutenFree">Gluten Free</option>
          <option value="ketogenic">Ketogenic</option>
          <option value="pescetarian">Pescetarian</option>
        </select>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Cuisine
        </label>
        <select
          value={filters.cuisine}
          onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
          className={`w-full px-4 py-3 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors`}
        >
          <option value="">All Cuisines</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
          <option value="Asian">Asian</option>
          <option value="Mediterranean">Mediterranean</option>
          <option value="American">American</option>
          <option value="Indian">Indian</option>
          <option value="French">French</option>
          <option value="Greek">Greek</option>
        </select>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Max Prep Time
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Clock size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          </div>
          <input
            type="number"
            placeholder="Minutes"
            value={filters.maxReadyTime}
            onChange={(e) => setFilters({...filters, maxReadyTime: e.target.value})}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
            } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors`}
          />
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Dietary Restrictions
        </label>
        <select
          multiple
          value={filters.intolerances}
          onChange={(e) => setFilters({...filters, intolerances: [...e.target.selectedOptions].map(o => o.value)})}
          className={`w-full px-4 py-3 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors`}
          size="3"
        >
          <option value="dairy">Dairy Free</option>
          <option value="egg">Egg Free</option>
          <option value="gluten">Gluten Free</option>
          <option value="peanut">Peanut Free</option>
          <option value="soy">Soy Free</option>
          <option value="treeNut">Tree Nut Free</option>
          <option value="shellfish">Shellfish Free</option>
        </select>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Calories Range
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Flame size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="number"
              placeholder="Min"
              value={filters.minCalories}
              onChange={(e) => setFilters({...filters, minCalories: e.target.value})}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors`}
            />
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Flame size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxCalories}
              onChange={(e) => setFilters({...filters, maxCalories: e.target.value})}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors`}
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Meal Type
        </label>
        <select
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          className={`w-full px-4 py-3 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
          } focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors`}
        >
          <option value="">All Types</option>
          <option value="breakfast">Breakfast</option>
          <option value="main course">Main Course</option>
          <option value="side dish">Side Dish</option>
          <option value="appetizer">Appetizer</option>
          <option value="salad">Salad</option>
          <option value="soup">Soup</option>
          <option value="dessert">Dessert</option>
          <option value="beverage">Beverage</option>
        </select>
      </div>

      {/* Macronutrient Filter Section */}
      <div className="col-span-3">
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Macronutrients
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Protein */}
          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-1">Protein (g)</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minProtein}
                onChange={(e) => setFilters({...filters, minProtein: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxProtein}
                onChange={(e) => setFilters({...filters, maxProtein: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
          </div>
          
          {/* Carbs */}
          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-1">Carbs (g)</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minCarbs}
                onChange={(e) => setFilters({...filters, minCarbs: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxCarbs}
                onChange={(e) => setFilters({...filters, maxCarbs: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-1">Fat (g)</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minFat}
                onChange={(e) => setFilters({...filters, minFat: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxFat}
                onChange={(e) => setFilters({...filters, maxFat: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Action Buttons with animation */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex space-x-2 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('popular')}
              className={`px-5 py-3 rounded-lg flex items-center gap-2 flex-1 sm:flex-initial justify-center transition-all duration-300 ${
                activeTab === 'popular' 
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} shadow-md` 
                  : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} shadow`
              }`}
            >
              <ChefHat size={18} />
              <span>Popular</span>
            </button>
            <button 
              onClick={() => setActiveTab('user')}
              className={`px-5 py-3 rounded-lg flex items-center gap-2 flex-1 sm:flex-initial justify-center transition-all duration-300 ${
                activeTab === 'user' 
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} shadow-md` 
                  : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} shadow`
              }`}
            >
              <Bookmark size={18} />
              <span>User Recipes</span>
            </button>
          </div>
          
          {user && (
            <button 
              onClick={handleAddRecipe}
              className={`w-full sm:w-auto ${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-600'} text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 justify-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1`}
            >
              <Plus size={18} />
              <span>Add Recipe</span>
            </button>
          )}
        </div>

        {/* Category Pills with scroll animation */}
        <div className="mb-8 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex space-x-2 whitespace-nowrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filterCategory === 'all'
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} shadow-md` 
                  : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} shadow`
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag size={14} />
                <span>All Categories</span>
              </div>
            </button>
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filterCategory === category
                    ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} shadow-md` 
                    : `${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} shadow`
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State with improved animation */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className={`w-20 h-20 border-t-4 border-b-4 ${darkMode ? 'border-blue-500' : 'border-blue-600'} border-solid rounded-full animate-spin`}></div>
              <ChefHat className={`w-10 h-10 ${darkMode ? 'text-blue-500' : 'text-blue-600'} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} />
            </div>
            <p className={`mt-6 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Preparing your culinary adventure...</p>
          </div>
        )}

        {/* Recipe Section with improved card grid */}
        {!loading && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {activeTab === 'popular' ? 'Popular Recipes' : 'User Submitted Recipes'}
                {filterCategory !== 'all' && (
                  <span className={`ml-2 text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    • {filterCategory}
                  </span>
                )}
              </h2>
              
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {displayedRecipes.length} {displayedRecipes.length === 1 ? 'recipe' : 'recipes'} found
              </p>
            </div>
            
            {displayedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedRecipes.map((recipe, index) => (
                  <div key={recipe.id} className="transform transition-all duration-300 hover:-translate-y-2">
                    <RecipeCard 
                      recipe={recipe}
                      user={user}
                      onClick={setSelectedRecipe}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <ChefHat className={`w-20 h-20 mx-auto mb-6 ${darkMode ? 'text-gray-600' : 'text-gray-400'} opacity-75`} />
                <h3 className={`text-2xl font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>No recipes found</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-8 max-w-md mx-auto`}>
                  {filterCategory !== 'all' 
                    ? `We couldn't find any ${filterCategory} recipes in the ${activeTab === 'popular' ? 'popular' : 'user'} section.`
                    : `We couldn't find any recipes in the ${activeTab === 'popular' ? 'popular' : 'user'} section.`}
                </p>
                {user && (
                  <button 
                    onClick={handleAddRecipe}
                    className={`inline-flex items-center gap-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium px-8 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <Plus size={18} />
                    <span>Create New Recipe</span>
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