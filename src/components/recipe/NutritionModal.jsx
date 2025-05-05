import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const NutritionModal = ({ recipe, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { darkMode } = useTheme();

  if (!recipe) return null;

  // Calculate total calories
  const calories = recipe.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0;
  
  // Group nutrients by category
  const nutrientCategories = {
    macros: ['Protein', 'Fat', 'Carbohydrates', 'Fiber', 'Sugar'],
    vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K', 'Vitamin B6', 'Vitamin B12', 'Folate'],
    minerals: ['Calcium', 'Iron', 'Magnesium', 'Potassium', 'Zinc', 'Phosphorus', 'Sodium']
  };
  
  // Filter nutrients by category
  const getNutrientsByCategory = (category) => {
    // Handle user-submitted recipes
    if (recipe.source === 'user') {
      const categoryMap = {
        macros: ['Protein', 'Fat', 'Carbohydrates', 'Sugar', 'Fiber'],
        vitamins: ['Vitamin B6', 'Folate', 'Vitamin B12', 'Vitamin C', 'Vitamin K', 'Vitamin E', 'Vitamin A'],
        minerals: ['Calcium', 'Iron', 'Magnesium', 'Potassium', 'Zinc', 'Phosphorus', 'Sodium']
      };
      
      return recipe.nutrition.nutrients.filter(n => 
        categoryMap[category].includes(n.name)
      );
    }
    
    // Original Spoonacular handling
    return recipe.nutrition?.nutrients.filter(n => nutrientCategories[category].includes(n.name)) || [];
  };
  
  // Get health score color
  const getHealthScoreColor = (score) => {
    if (score >= 80) return darkMode ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return darkMode ? 'text-green-300' : 'text-green-500';
    if (score >= 40) return darkMode ? 'text-yellow-300' : 'text-yellow-500';
    return darkMode ? 'text-red-400' : 'text-red-500';
  };

  // Update the healthScore constant
  const healthScore = (() => {
    if (recipe.source === 'spoonacular' && typeof recipe.healthScore === 'number') {
      return recipe.healthScore;
    }
    if (recipe.source === 'user' && typeof recipe.health_score === 'number') {
      return recipe.health_score;
    }
    // Only use fallback if no valid health score exists
    if (recipe.veryHealthy) return 95;
    if (recipe.budget_friendly) return 85;
    return 75;
  })();

  // Update getDietaryTags function
  const getDietaryTags = () => {
    const tags = [];
    if (recipe.gluten_free) tags.push({ name: 'Gluten-Free', color: darkMode ? 'bg-purple-600' : 'bg-purple-500' });
    if (recipe.vegetarian) tags.push({ name: 'Vegetarian', color: darkMode ? 'bg-green-600' : 'bg-green-500' });
    if (recipe.vegan) tags.push({ name: 'Vegan', color: darkMode ? 'bg-green-700' : 'bg-green-600' });
    if (recipe.dairy_free) tags.push({ name: 'Dairy-Free', color: darkMode ? 'bg-blue-600' : 'bg-blue-500' });
    if (recipe.low_fodmap) tags.push({ name: 'Low FODMAP', color: darkMode ? 'bg-yellow-600' : 'bg-yellow-500' });
    if (recipe.sustainable) tags.push({ name: 'Sustainable', color: darkMode ? 'bg-teal-600' : 'bg-teal-500' });
    if (recipe.very_healthy) tags.push({ name: 'Very Healthy', color: darkMode ? 'bg-pink-600' : 'bg-pink-500' });
    if (recipe.budget_friendly) tags.push({ name: 'Budget-Friendly', color: darkMode ? 'bg-orange-600' : 'bg-orange-500' });
    return tags;
  };

  return (
    // Outer overlay with transparent background and blur
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      {/* Modal content container with semi-transparent background */}
      <div className={`${darkMode ? 'bg-[#2D2D2D]/90' : 'bg-white/90'} rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-start mb-4">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>{recipe.title}</h2>
          <button 
            onClick={onClose}
            className={`${darkMode ? 'text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300'} text-2xl rounded-full h-8 w-8 flex items-center justify-center transition`}
            aria-label="Close nutrition modal"
          >
            &times;
          </button>
        </div>
        
        {/* Tabs */}
        <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'} mb-6`}>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 focus:outline-none ${activeTab === 'overview' ? `border-b-2 ${darkMode ? 'border-blue-400 text-blue-400' : 'border-[#007BFF] text-[#007BFF]'}` : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('nutrients')}
            className={`px-4 py-2 focus:outline-none ${activeTab === 'nutrients' ? `border-b-2 ${darkMode ? 'border-blue-400 text-blue-400' : 'border-[#007BFF] text-[#007BFF]'}` : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`}`}
          >
            Detailed Nutrients
          </button>
          <button 
            onClick={() => setActiveTab('dietary')}
            className={`px-4 py-2 focus:outline-none ${activeTab === 'dietary' ? `border-b-2 ${darkMode ? 'border-blue-400 text-blue-400' : 'border-[#007BFF] text-[#007BFF]'}` : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`}`}
          >
            Dietary Info
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Calories and Health Score */}
              <div className="flex justify-between items-center">
                <div className={`flex flex-col items-center p-4 ${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} rounded-lg`}>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Calories</span>
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#212529]'}`}>{calories}</span>
                </div>
                
                <div className={`flex flex-col items-center p-4 ${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} rounded-lg`}>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Health Score</span>
                  <span className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {healthScore || 'N/A'}
                  </span>
                </div>
                
                <div className={`flex flex-col items-center p-4 ${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} rounded-lg`}>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Servings</span>
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#212529]'}`}>{recipe.servings || 1}</span>
                </div>
              </div>
              
              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-2">
                {getDietaryTags().map(tag => (
                  <span key={tag.name} className={`${tag.color} text-white px-3 py-1 rounded-full text-xs`}>
                    {tag.name}
                  </span>
                ))}
              </div>
              
              {/* Macronutrient Breakdown */}
              {recipe.nutrition && (
                <div className={`${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} p-4 rounded-lg`}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-3`}>Macronutrient Breakdown of % Daily Needs</h3>
                  
                  {/* Macronutrient Bars */}
                  <div className="space-y-4">
                    {['Protein', 'Fat', 'Carbohydrates'].map(macro => {
                      const nutrient = recipe.nutrition.nutrients.find(n => n.name === macro);
                      const percentage = nutrient ? nutrient.percentOfDailyNeeds : 0;
                      
                      return (
                        <div key={macro} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{macro}</span>
                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{nutrient?.amount}g ({percentage?.toFixed(1)}% DV)</span>
                          </div>
                          <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                            <div 
                              className={`h-full ${
                                macro === 'Protein' ? 'bg-blue-500' : 
                                macro === 'Fat' ? 'bg-red-500' : 'bg-green-500'
                              }`} 
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Detailed Nutrients Tab */}
          {activeTab === 'nutrients' && recipe.nutrition && (
            <div className="space-y-6">
              {/* Macronutrients */}
              <div className={`${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} p-4 rounded-lg`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-3`}>Macronutrients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getNutrientsByCategory('macros').map(nutrient => (
                    <div key={nutrient.name} className="flex justify-between items-center">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{nutrient.name}</span>
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-[#212529]'}`}>{nutrient.amount}{nutrient.unit}</span>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>({nutrient.percentOfDailyNeeds?.toFixed(1)}% DV)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Vitamins */}
              <div className={`${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} p-4 rounded-lg`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-3`}>Vitamins</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getNutrientsByCategory('vitamins').map(nutrient => (
                    <div key={nutrient.name} className="flex justify-between items-center">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{nutrient.name}</span>
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-[#212529]'}`}>{nutrient.amount}{nutrient.unit}</span>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>({nutrient.percentOfDailyNeeds?.toFixed(1)}% DV)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Minerals */}
              <div className={`${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} p-4 rounded-lg`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-3`}>Minerals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getNutrientsByCategory('minerals').map(nutrient => (
                    <div key={nutrient.name} className="flex justify-between items-center">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{nutrient.name}</span>
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-[#212529]'}`}>{nutrient.amount}{nutrient.unit}</span>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>({nutrient.percentOfDailyNeeds?.toFixed(1)}% DV)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Dietary Info Tab */}
          {activeTab === 'dietary' && (
            <div className="space-y-6">
              {/* Dietary Information */}
              <div className={`${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} p-4 rounded-lg`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-3`}>Dietary Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.gluten_free ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gluten-Free</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.vegetarian ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vegetarian</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.vegan ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vegan</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.dairy_free ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dairy-Free</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.low_fodmap ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Low FODMAP</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.sustainable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sustainable</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.very_healthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Very Healthy</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.budget_friendly ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Budget-Friendly</span>
                  </div>
                </div>
                
                {/* Diets */}
                {recipe.diets && recipe.diets.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Compatible Diets</h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.diets.map(diet => (
                        <span key={diet} className={`${darkMode ? 'bg-teal-800' : 'bg-teal-500'} text-white px-3 py-1 rounded-full text-xs`}>
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Additional Notes */}
                {recipe.veryPopular && (
                  <div className={`mt-4 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center`}>
                    <span className={`${darkMode ? 'text-yellow-300' : 'text-yellow-500'} text-xl mr-2`}>★</span>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>This is a very popular recipe!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionModal;