import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NutritionModal from './NutritionModal';

const RecipeModal = ({ recipeId, onClose }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // First try fetching as user recipe
        const response = await axios.get(`/api/user-recipe/${recipeId}`);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">{recipe.title}</h2>
                {recipe.source === 'user' && (
                  <p className="text-sm text-gray-400 mt-1">
                    Status: {recipe.status || 'pending'}
                  </p>
                )}
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>
            
            {recipe.image && (
              <img
                src={imageUrl}
                alt={recipe.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide broken images
                }}
              />
            )}
            {!recipe.image && (
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1">
                  {recipe.extendedIngredients.map((ingredient, i) => (
                    <li 
                      key={ingredient.id || `${i}-${ingredient.name}`} // Add unique key
                      className="text-gray-300"
                    >
                      {ingredient.original}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Instructions</h3>
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenNutritionModal}
              className="mt-4 w-full bg-yellow-500 text-gray-900 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
            >
              Show Nutrition Details
            </button>

            {isNutritionModalOpen && (
              <NutritionModal
                recipe={recipe}
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