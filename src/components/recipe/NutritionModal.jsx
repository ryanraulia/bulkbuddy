import React, { useState } from 'react';

const NutritionModal = ({ recipe, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
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
    return recipe.nutrition?.nutrients.filter(n => nutrientCategories[category].includes(n.name)) || [];
  };
  
  // Get health score color
  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-green-300';
    if (score >= 40) return 'text-yellow-300';
    return 'text-red-400';
  };
  
  // Get dietary tags
  const getDietaryTags = () => {
    const tags = [];
    if (recipe.glutenFree) tags.push({ name: 'Gluten-Free', color: 'bg-purple-600' });
    if (recipe.vegetarian) tags.push({ name: 'Vegetarian', color: 'bg-green-600' });
    if (recipe.vegan) tags.push({ name: 'Vegan', color: 'bg-green-700' });
    if (recipe.dairyFree) tags.push({ name: 'Dairy-Free', color: 'bg-blue-600' });
    if (recipe.lowFodmap) tags.push({ name: 'Low FODMAP', color: 'bg-yellow-600' });
    if (recipe.sustainable) tags.push({ name: 'Sustainable', color: 'bg-teal-600' });
    return tags;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">{recipe.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl rounded-full h-8 w-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition"
            aria-label="Close nutrition modal"
          >
            &times;
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 focus:outline-none ${activeTab === 'overview' ? 'border-b-2 border-yellow-400 text-yellow-400' : 'text-gray-400'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('nutrients')}
            className={`px-4 py-2 focus:outline-none ${activeTab === 'nutrients' ? 'border-b-2 border-yellow-400 text-yellow-400' : 'text-gray-400'}`}
          >
            Detailed Nutrients
          </button>
          <button 
            onClick={() => setActiveTab('dietary')}
            className={`px-4 py-2 focus:outline-none ${activeTab === 'dietary' ? 'border-b-2 border-yellow-400 text-yellow-400' : 'text-gray-400'}`}
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
                <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-300">Total Calories</span>
                  <span className="text-2xl font-bold text-white">{calories}</span>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-300">Health Score</span>
                  <span className={`text-2xl font-bold ${getHealthScoreColor(recipe.healthScore)}`}>
                    {recipe.healthScore || 'N/A'}
                  </span>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-300">Servings</span>
                  <span className="text-2xl font-bold text-white">{recipe.servings || 1}</span>
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
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">Macronutrient Breakdown</h3>
                  
                  {/* Macronutrient Bars */}
                  <div className="space-y-4">
                    {['Protein', 'Fat', 'Carbohydrates'].map(macro => {
                      const nutrient = recipe.nutrition.nutrients.find(n => n.name === macro);
                      const percentage = nutrient ? nutrient.percentOfDailyNeeds : 0;
                      
                      return (
                        <div key={macro} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{macro}</span>
                            <span>{nutrient?.amount}g ({percentage?.toFixed(1)}% DV)</span>
                          </div>
                          <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
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
                  
                  {/* Caloric Distribution Pie Chart Approximation */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Caloric Distribution</h4>
                    <div className="flex h-6 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500" 
                        style={{ width: `${recipe.nutrition.caloricBreakdown.percentProtein}%` }}
                        title={`Protein: ${recipe.nutrition.caloricBreakdown.percentProtein?.toFixed(1)}%`}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${recipe.nutrition.caloricBreakdown.percentFat}%` }}
                        title={`Fat: ${recipe.nutrition.caloricBreakdown.percentFat?.toFixed(1)}%`}
                      ></div>
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${recipe.nutrition.caloricBreakdown.percentCarbs}%` }}
                        title={`Carbs: ${recipe.nutrition.caloricBreakdown.percentCarbs?.toFixed(1)}%`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-blue-500">Protein {recipe.nutrition.caloricBreakdown.percentProtein?.toFixed(1)}%</span>
                      <span className="text-red-500">Fat {recipe.nutrition.caloricBreakdown.percentFat?.toFixed(1)}%</span>
                      <span className="text-green-500">Carbs {recipe.nutrition.caloricBreakdown.percentCarbs?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Detailed Nutrients Tab */}
          {activeTab === 'nutrients' && recipe.nutrition && (
            <div className="space-y-6">
              {/* Macronutrients */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Macronutrients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getNutrientsByCategory('macros').map(nutrient => (
                    <div key={nutrient.name} className="flex justify-between items-center">
                      <span>{nutrient.name}</span>
                      <div>
                        <span className="font-medium">{nutrient.amount}{nutrient.unit}</span>
                        <span className="text-sm text-gray-400 ml-2">({nutrient.percentOfDailyNeeds?.toFixed(1)}% DV)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Vitamins */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Vitamins</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getNutrientsByCategory('vitamins').map(nutrient => (
                    <div key={nutrient.name} className="flex justify-between items-center">
                      <span>{nutrient.name}</span>
                      <div>
                        <span className="font-medium">{nutrient.amount}{nutrient.unit}</span>
                        <span className="text-sm text-gray-400 ml-2">({nutrient.percentOfDailyNeeds?.toFixed(1)}% DV)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Minerals */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Minerals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getNutrientsByCategory('minerals').map(nutrient => (
                    <div key={nutrient.name} className="flex justify-between items-center">
                      <span>{nutrient.name}</span>
                      <div>
                        <span className="font-medium">{nutrient.amount}{nutrient.unit}</span>
                        <span className="text-sm text-gray-400 ml-2">({nutrient.percentOfDailyNeeds?.toFixed(1)}% DV)</span>
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
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Dietary Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.glutenFree ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Gluten-Free</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.vegetarian ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Vegetarian</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.vegan ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Vegan</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.dairyFree ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Dairy-Free</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.lowFodmap ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Low FODMAP</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.sustainable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Sustainable</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.veryHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Very Healthy</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${recipe.cheap ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Budget-Friendly</span>
                  </div>
                </div>
                
                {/* Diets */}
                {recipe.diets && recipe.diets.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Compatible Diets</h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.diets.map(diet => (
                        <span key={diet} className="bg-teal-800 text-white px-3 py-1 rounded-full text-xs">
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Additional Notes */}
                {recipe.veryPopular && (
                  <div className="mt-4 p-3 bg-gray-600 rounded-lg flex items-center">
                    <span className="text-yellow-300 text-xl mr-2">★</span>
                    <span>This is a very popular recipe!</span>
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