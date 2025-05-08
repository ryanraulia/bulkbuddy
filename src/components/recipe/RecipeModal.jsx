import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NutritionModal from './NutritionModal';
import { Clock, User, Calendar, Star, X, Info, Utensils, Leaf } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // Import ThemeContext

const RecipeModal = ({ recipeId, onClose }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showMealPlanForm, setShowMealPlanForm] = useState(false);
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [mealType, setMealType] = useState('dinner');
  const { darkMode } = useTheme(); // Use ThemeContext
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Corrected endpoint for user recipes
        const response = await axios.get(`/api/user/recipes/${recipeId}`, { withCredentials: true });
        if (response.data) {
          setRecipe({
            ...response.data,
            source: 'user'
          });
        }
      } catch (error) {
        // Fallback to Spoonacular recipe
        try {
          const spoonacularResponse = await axios.get(`/api/recipe/${recipeId}`);
          setRecipe({
            ...spoonacularResponse.data,
            source: 'spoonacular'
          });
        } catch (spoonacularError) {
          console.error('Error fetching recipe:', spoonacularError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleOpenNutritionModal = () => {
    setIsNutritionModalOpen(true);
  };

  const handleCloseNutritionModal = () => {
    setIsNutritionModalOpen(false);
  };

  const imageUrl = recipe?.image?.startsWith('/uploads')
    ? `http://localhost:5000${recipe.image}?${Date.now()}`
    : recipe?.image;

  // Format recipe metadata
  const renderRecipeMetadata = () => {
    if (!recipe) return null;

    return (
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-200">
        {recipe.readyInMinutes && (
          <div className="flex items-center bg-emerald-900 bg-opacity-70 px-3 py-1 rounded-full">
            <Clock size={16} className="mr-1 text-emerald-300" />
            <span>{recipe.readyInMinutes} mins</span>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center bg-indigo-900 bg-opacity-70 px-3 py-1 rounded-full">
            <User size={16} className="mr-1 text-indigo-300" />
            <span>{recipe.servings} servings</span>
          </div>
        )}
        {recipe.createdAt && (
          <div className="flex items-center bg-purple-900 bg-opacity-70 px-3 py-1 rounded-full">
            <Calendar size={16} className="mr-1 text-purple-300" />
            <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
          </div>
        )}

        {recipe.healthScore && recipe.source === 'spoonacular' && (
          <div className="flex items-center bg-amber-900 bg-opacity-70 px-3 py-1 rounded-full">
            <Star size={16} className="mr-1 text-amber-300" />
            <span>Health score: {recipe.healthScore}</span>
          </div>
        )}

        {recipe.health_score && recipe.source === 'user' && (
          <div className="flex items-center bg-amber-900 bg-opacity-70 px-3 py-1 rounded-full">
            <Star size={16} className="mr-1 text-amber-300" />
            <span>Health score: {recipe.health_score}</span>
          </div>
        )}
        {recipe.vegetarian && (
          <div className="flex items-center bg-green-900 bg-opacity-70 px-3 py-1 rounded-full">
            <Leaf size={16} className="mr-1 text-green-300" />
            <span>Vegetarian</span>
          </div>
        )}
      </div>
    );
  };

  const getDietaryTags = () => {
    return [
      recipe.gluten_free && { name: 'Gluten-Free', color: 'bg-purple-600' },
      recipe.vegetarian && { name: 'Vegetarian', color: 'bg-green-600' },
      recipe.vegan && { name: 'Vegan', color: 'bg-green-700' },
      recipe.dairy_free && { name: 'Dairy-Free', color: 'bg-blue-600' },
      recipe.low_fodmap && { name: 'Low FODMAP', color: 'bg-yellow-600' },
      recipe.sustainable && { name: 'Sustainable', color: 'bg-teal-600' },
      recipe.very_healthy && { name: 'Very Healthy', color: 'bg-emerald-600' },
      recipe.budget_friendly && { name: 'Budget Friendly', color: 'bg-orange-600' }
    ].filter(Boolean);
  };

  return (
    // Outer overlay with transparent background and blur
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Modal content container with semi-transparent background */}
      <div
        className={`${
          darkMode ? 'bg-[#2D2D2D]/90' : 'bg-white/90'
        } rounded-xl shadow-2xl border ${
          darkMode ? 'border-gray-700' : 'border-gray-300'
        } max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Loading recipe details...
            </p>
          </div>
        ) : (
          <>
            {/* Header with image as background */}
            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage: recipe.image ? `url(${imageUrl})` : 'none',
                backgroundColor: !recipe.image ? (darkMode ? '#1E1E1E' : '#F8F9FA') : undefined
              }}
            >
              {/* Overlay gradient */}
              <div
                className={`absolute inset-0 ${
                  darkMode
                    ? 'bg-gradient-to-t from-[#2D2D2D] via-[#2D2D2D]/70 to-transparent'
                    : 'bg-gradient-to-t from-gray-100 via-gray-100/70 to-transparent'
                }`}
              ></div>

              {/* Close button */}
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 ${
                  darkMode
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900'
                } rounded-full p-2 transition-all z-10 shadow-lg`}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              {/* Recipe title and status */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h2
                      className={`text-3xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {recipe.title}
                    </h2>
                    {recipe.source === 'user' && (
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          recipe.status === 'approved'
                            ? 'bg-emerald-600 text-emerald-100'
                            : recipe.status === 'rejected'
                            ? 'bg-rose-600 text-rose-100'
                            : 'bg-amber-600 text-amber-100'
                        }`}
                      >
                        {recipe.status || 'pending'}
                      </span>
                    )}
                    {recipe.source === 'spoonacular' && (
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-sky-600 text-sky-100">
                        Spoonacular
                      </span>
                    )}
                  </div>
                </div>

                {renderRecipeMetadata()}
              </div>
            </div>

            {/* Tab navigation */}
            <div
              className={`flex border-b ${
                darkMode ? 'border-gray-700 bg-[#2D2D2D]' : 'border-gray-300 bg-gray-100'
              }`}
            >
              <button
                className={`px-6 py-4 font-medium text-sm transition-all ${
                  activeTab === 'ingredients'
                    ? darkMode
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-[#1E1E1E]'
                      : 'text-[#007BFF] border-b-2 border-[#007BFF] bg-gray-200'
                    : darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('ingredients')}
              >
                Ingredients
              </button>
              <button
                className={`px-6 py-4 font-medium text-sm transition-all ${
                  activeTab === 'instructions'
                    ? darkMode
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-[#1E1E1E]'
                      : 'text-[#007BFF] border-b-2 border-[#007BFF] bg-gray-200'
                    : darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('instructions')}
              >
                Instructions
              </button>
            </div>

            {/* Content */}
            <div
              className={`p-6 overflow-y-auto ${
                darkMode ? 'bg-[#2D2D2D]' : 'bg-white'
              }`}
            >
              {activeTab === 'ingredients' && (
                <div>
                  <ul className="space-y-3">
                    {recipe.extendedIngredients.map((ingredient, i) => (
                      <li
                        key={ingredient.id || `${i}-${ingredient.name}`}
                        className={`flex items-start p-2 rounded-lg ${
                          darkMode
                            ? 'hover:bg-gray-700/50'
                            : 'hover:bg-gray-200'
                        } transition-colors`}
                      >
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            darkMode ? 'bg-teal-500' : 'bg-teal-400'
                          } mt-2 mr-3 shadow-sm`}
                        ></span>
                        <span
                          className={`${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {ingredient.original}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'instructions' && (
                <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none prose-lg`}>
                  {recipe.source === 'user'
                    ? recipe.instructions.split('\n').map((line, i) => <p key={i}>{line}</p>) // Render plain text as paragraphs
                    : <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} /> // Render HTML for Spoonacular recipes
                  }
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`p-4 border-t ${
                darkMode ? 'border-gray-700 bg-[#2D2D2D]' : 'border-gray-300 bg-gray-100'
              } mt-auto`}
            >
              <button
                onClick={() => setShowMealPlanForm(true)}
                className={`w-full ${
                  darkMode
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                    : 'bg-gradient-to-r from-orange-400 to-amber-400 text-gray-900'
                } py-3 rounded-lg hover:from-orange-400 hover:to-amber-400 transition-all font-medium flex items-center justify-center shadow-lg mb-3`}
              >
                <Utensils size={18} className="mr-2" />
                Add to Meal Plan
              </button>

              {showMealPlanForm && (
                <div
                  className={`${
                    darkMode ? 'bg-gray-800/70' : 'bg-gray-200'
                  } p-4 rounded-lg mb-4`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className={`text-lg font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Plan This Meal
                    </h3>
                    <button
                      onClick={() => setShowMealPlanForm(false)}
                      className={`${
                        darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar
                        className={`${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                        size={18}
                      />
                      <input
                        type="date"
                        value={mealDate}
                        onChange={(e) => setMealDate(e.target.value)}
                        className={`${
                          darkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-200 text-gray-900'
                        } px-3 py-2 rounded-lg w-full`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Utensils
                        className={`${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                        size={18}
                      />
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className={`${
                          darkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-200 text-gray-900'
                        } px-3 py-2 rounded-lg w-full`}
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>

                    <button
                      onClick={async () => {
                        if (!mealDate) {
                          alert('Please select a date');
                          return;
                        }

                        try {
                          await axios.post(
                            '/api/custom-mealplan',
                            {
                              recipeId: recipe.id,
                              source: recipe.source,
                              date: mealDate,
                              mealType: mealType
                            },
                            {
                              withCredentials: true,
                              validateStatus: (status) => status < 500
                            }
                          );

                          setShowMealPlanForm(false);
                          alert('Added to meal plan!');
                        } catch (error) {
                          console.error('Error adding to meal plan:', error);
                          alert(
                            error.response?.data?.error ||
                              'Error adding to meal plan'
                          );
                        }
                      }}
                      className={`w-full ${
                        darkMode
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-green-500 hover:bg-green-400 text-gray-900'
                      } py-2 rounded-lg transition-colors`}
                    >
                      Add to Plan
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleOpenNutritionModal}
                className={`w-full ${
                  darkMode
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-teal-400 to-emerald-400 text-gray-900'
                } py-3 rounded-lg hover:from-teal-400 hover:to-emerald-400 transition-all font-medium flex items-center justify-center shadow-lg`}
              >
                <Info size={18} className="mr-2" />
                Nutrition Details
              </button>
            </div>

            {isNutritionModalOpen && (
              <NutritionModal
                recipe={recipe}
                dietaryTags={getDietaryTags()}
                onClose={handleCloseNutritionModal}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeModal;