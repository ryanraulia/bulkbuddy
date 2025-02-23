// src/components/recipe/NutritionModal.jsx
import React from 'react';

const NutritionModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">{recipe.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          {/* Dietary Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Dietary Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Gluten-Free: {recipe.glutenFree ? 'Yes' : 'No'}</div>
              <div>Vegetarian: {recipe.vegetarian ? 'Yes' : 'No'}</div>
              <div>Vegan: {recipe.vegan ? 'Yes' : 'No'}</div>
              <div>Dairy-Free: {recipe.dairyFree ? 'Yes' : 'No'}</div>
              <div>Low FODMAP: {recipe.lowFodmap ? 'Yes' : 'No'}</div>
              <div>Sustainable: {recipe.sustainable ? 'Yes' : 'No'}</div>
              <div>Very Healthy: {recipe.veryHealthy ? 'Yes' : 'No'}</div>
              <div>Cheap: {recipe.cheap ? 'Yes' : 'No'}</div>
              <div>Very Popular: {recipe.veryPopular ? 'Yes' : 'No'}</div>
              <div className="col-span-2">Diets: {recipe.diets?.join(', ') || 'None'}</div>
            </div>
          </div>

          {/* Nutritional Information Section */}
          {recipe.nutrition && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Nutritional Information</h3>
              
              {/* Macronutrients */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Macronutrients</h4>
                <div className="space-y-1">
                  {recipe.nutrition.nutrients
                    .filter(n => ['Protein', 'Fat', 'Carbohydrates'].includes(n.name))
                    .map(nutrient => (
                      <div key={nutrient.name} className="flex justify-between">
                        <span>{nutrient.name}:</span>
                        <span>
                          {nutrient.amount}g ({nutrient.percentOfDailyNeeds?.toFixed(2)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Micronutrients */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Micronutrients</h4>
                <div className="grid grid-cols-2 gap-2">
                  {recipe.nutrition.nutrients
                    .filter(n => ['Vitamin A', 'Vitamin C', 'Calcium', 'Iron', 'Potassium'].includes(n.name))
                    .map(nutrient => (
                      <div key={nutrient.name} className="flex justify-between">
                        <span>{nutrient.name}:</span>
                        <span>
                          {nutrient.amount}{nutrient.unit} ({nutrient.percentOfDailyNeeds?.toFixed(2)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Caloric Breakdown */}
              <div>
                <h4 className="font-medium mb-2">Caloric Breakdown</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span>{recipe.nutrition.caloricBreakdown.percentProtein?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span>{recipe.nutrition.caloricBreakdown.percentFat?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbohydrates:</span>
                    <span>{recipe.nutrition.caloricBreakdown.percentCarbs?.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionModal;