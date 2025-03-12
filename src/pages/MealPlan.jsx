// src/pages/MealPlan.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NutritionModal from '../components/recipe/NutritionModal';

export default function MealPlan() {
  const location = useLocation();
  const mealPlanData = location.state;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

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
          fetch(`http://localhost:5000/api/recipe/${id}`).then(res => res.json())
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
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen py-8 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-8">Your Meal Plan</h1>
        
        {/* Filters summary */}
        {mealPlanData?.filters && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="text-yellow-400 text-lg font-bold mb-2">Applied Filters</h2>
            <div className="flex flex-wrap gap-4">
              {/* Diet filter */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">Diet:</span>
                <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                  {mealPlanData.filters.diet || 'None'}
                </span>
              </div>
              
              {/* Exclusions filter */}
              {mealPlanData.filters.exclude && mealPlanData.filters.exclude !== 'none' && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">Excluding:</span>
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                    {mealPlanData.filters.exclude}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-4">
            <p className="text-lg animate-pulse text-yellow-400">Loading your meal plan...</p>
          </div>
        )}

        {error && (
          <div className="text-red-500 p-4 mb-4 bg-red-100 rounded">
            Error: {error}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Calorie Breakdown</h2>
            <div className="space-y-4">
              {recipes.map((recipe, index) => (
                <div key={`calorie-${index}`} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">{getMealType(recipe, index)}</span>
                    <span className="text-yellow-400">{Math.round(recipe.calories)} cal</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${calculateProgress(recipe.calories)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="font-bold">Total Calories</span>
                  <span className="font-bold text-yellow-400">
                    {Math.round(getTotalCalories())} / {Math.round(totalNutrients.calories)} cal
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(getTotalCalories() / totalNutrients.calories) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <div key={recipe.id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition">
              <h3 className="text-xl font-bold mb-3 text-yellow-400">{getMealType(recipe, index)}</h3>
              <div className="space-y-3">
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <h4 className="text-lg font-semibold text-yellow-400">{recipe.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Calories:</span>
                  <span>{Math.round(recipe.calories)} cal</span>
                </div>
                {recipe.extendedIngredients && (
                  <div>
                    <h5 className="font-medium mb-2">Ingredients:</h5>
                    <ul className="list-disc ml-5 space-y-1">
                      {recipe.extendedIngredients.map((ingredient, i) => (
                        <li key={i} className="text-gray-300">{ingredient.original}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => setSelectedRecipe(recipe)}
                  className="mt-2 w-full bg-yellow-500 text-gray-900 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
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