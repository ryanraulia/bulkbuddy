import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NutritionModal from '../components/recipe/NutritionModal';
import { useTheme } from '../context/ThemeContext';

export default function MealPlan() {
  const location = useLocation();
  const mealPlanData = location.state;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const { darkMode } = useTheme();

  const getTotalNutrients = () => {
    if (!mealPlanData) return { calories: 0 };

    // Handle weekly plan structure
    if (mealPlanData.week) {
      return Object.values(mealPlanData.week).reduce((total, day) => ({
        calories: total.calories + (day.nutrients?.calories || 0),
        protein: total.protein + (day.nutrients?.protein || 0),
        fat: total.fat + (day.nutrients?.fat || 0),
        carbs: total.carbs + (day.nutrients?.carbs || 0)
      }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
    }

    // Handle daily plan structure
    return mealPlanData.nutrients || { calories: 0 };
  };

  const calculateProgress = (calories) => {
    const targetCalories = getTotalNutrients().calories;
    return targetCalories > 0 ? Math.min((calories / targetCalories) * 100, 100) : 0;
  };

  const getTotalCalories = () => {
    return recipes.reduce((total, recipe) => total + (recipe.calories || 0), 0);
  };

  const totalNutrients = getTotalNutrients();

  useEffect(() => {
    async function fetchRecipeDetails() {
      if (!mealPlanData) {
        setLoading(false);
        setError("No meal plan data available");
        return;
      }

      try {
        let mealIds = [];
        
        // Handle weekly structure
        if (mealPlanData.week) {
          mealIds = Object.values(mealPlanData.week)
            .flatMap(day => day.meals)
            .map(meal => meal.id);
        } 
        // Handle daily structure
        else if (mealPlanData.meals) {
          mealIds = mealPlanData.meals.map(meal => meal.id);
        }

        const recipePromises = mealIds.map(id =>
          fetch(`http://localhost:5000/api/recipes/${id}`).then(res => res.json())
        );

        const recipeDetails = await Promise.all(recipePromises);
        setRecipes(recipeDetails);
      } catch (error) {
        console.error("Error fetching recipe details:", error);
        setError("Failed to fetch recipe details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipeDetails();
  }, [mealPlanData]);

  const getMealType = (meal, index) => {
    if (mealPlanData?.week) {
      const days = Object.keys(mealPlanData.week);
      const dayIndex = Math.floor(index / 3); // 3 meals per day
      return `${days[dayIndex]} - ${meal.title}`;
    }
    const types = ["Breakfast", "Lunch", "Dinner"];
    return types[index] || meal.title;
  };

  return (
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gradient-to-b from-[#121212] via-[#181818] to-[#121212]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className={`text-4xl font-extrabold text-center ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-8`}>Your Meal Plan</h1>
        
        {/* Filters summary */}
        {mealPlanData?.filters && (
          <div className={`${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'} p-4 rounded-lg mb-6`}>
            <h2 className={`${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} text-lg font-bold mb-2`}>Applied Filters</h2>
            <div className="flex flex-wrap gap-4">
              {/* Diet filter */}
              <div className="flex items-center space-x-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Diet:</span>
                <span className={`${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-[#007BFF]/20 text-[#007BFF]'} px-3 py-1 rounded-full text-sm`}>
                  {mealPlanData.filters.diet || 'None'}
                </span>
              </div>
              
              {/* Exclusions filter */}
              {mealPlanData.filters.exclude && mealPlanData.filters.exclude !== 'none' && (
                <div className="flex items-center space-x-2">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Excluding:</span>
                  <span className={`${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-500'} px-3 py-1 rounded-full text-sm`}>
                    {mealPlanData.filters.exclude}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-4">
            <p className={`text-lg animate-pulse ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>Loading your meal plan...</p>
          </div>
        )}

        {error && (
          <div className={`${darkMode ? 'bg-red-800 text-red-200' : 'bg-red-50 text-red-500'} p-4 mb-4 rounded`}>
            Error: {error}
          </div>
        )}

        {recipes.length > 0 && (
          <div className={`${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'} p-6 rounded-lg shadow-lg mb-8`}>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-4`}>Calorie Breakdown</h2>
            <div className="space-y-4">
              {recipes.map((recipe, index) => (
                <div key={`calorie-${index}`} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{getMealType(recipe, index)}</span>
                    <span className={`${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>{Math.round(recipe.calories)} cal</span>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div 
                      className={`${darkMode ? 'bg-blue-400' : 'bg-[#007BFF]'} h-2 rounded-full transition-all duration-500`} 
                      style={{ width: `${calculateProgress(recipe.calories)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'} pt-4 mt-4`}>
                <div className="flex justify-between">
                  <span className="font-bold">Total Calories</span>
                  <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>
                    {Math.round(getTotalCalories())} / {Math.round(totalNutrients.calories)} cal
                  </span>
                </div>
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-2`}>
                  <div 
                    className={`${darkMode ? 'bg-green-400' : 'bg-green-500'} h-2 rounded-full transition-all duration-500`} 
                    style={{ width: `${(getTotalCalories() / totalNutrients.calories) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <div key={recipe.id} className={`${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'} p-6 rounded-lg shadow-lg hover:shadow-2xl transition`}>
              <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>{getMealType(recipe, index)}</h3>
              <div className="space-y-3">
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>{recipe.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Calories:</span>
                  <span>{Math.round(recipe.calories)} cal</span>
                </div>
                {recipe.extendedIngredients && (
                  <div>
                    <h5 className="font-medium mb-2">Ingredients:</h5>
                    <ul className="list-disc ml-5 space-y-1">
                      {recipe.extendedIngredients.map((ingredient, i) => (
                        <li key={i} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{ingredient.original}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`mt-2 w-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#007BFF] hover:bg-[#0056b3]'} text-white py-2 rounded-lg transition-colors font-medium`}
                >
                  Show Nutrition Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedRecipe && (
          <NutritionModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </div>
    </div>
  );
}