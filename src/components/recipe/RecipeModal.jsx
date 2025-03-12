import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NutritionModal from './NutritionModal';
import { Clock, User, Calendar, Star, X, Info } from 'lucide-react';

const RecipeModal = ({ recipeId, onClose }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');

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

  // Format recipe metadata
  const renderRecipeMetadata = () => {
    if (!recipe) return null;
    
    return (
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-400">
        {recipe.readyInMinutes && (
          <div className="flex items-center">
            <Clock size={16} className="mr-1 text-yellow-500" />
            <span>{recipe.readyInMinutes} mins</span>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center">
            <User size={16} className="mr-1 text-yellow-500" />
            <span>{recipe.servings} servings</span>
          </div>
        )}
        {recipe.createdAt && (
          <div className="flex items-center">
            <Calendar size={16} className="mr-1 text-yellow-500" />
            <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
          </div>
        )}
        {recipe.healthScore && (
          <div className="flex items-center">
            <Star size={16} className="mr-1 text-yellow-500" />
            <span>Health score: {recipe.healthScore}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading recipe details...</p>
          </div>
        ) : (
          <>
            {/* Header with image as background */}
            <div 
              className="relative h-56 bg-cover bg-center" 
              style={{ 
                backgroundImage: recipe.image ? `url(${imageUrl})` : 'none',
                backgroundColor: !recipe.image ? '#374151' : undefined
              }}
            >
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              
              {/* Close button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-gray-900 bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75 transition-all z-10"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              
              {/* Recipe title and status */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">{recipe.title}</h2>
                    {recipe.source === 'user' && (
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                        recipe.status === 'approved' ? 'bg-green-500 text-green-100' : 
                        recipe.status === 'rejected' ? 'bg-red-500 text-red-100' : 
                        'bg-yellow-500 text-yellow-100'
                      }`}>
                        {recipe.status || 'pending'}
                      </span>
                    )}
                    {recipe.source === 'spoonacular' && (
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-blue-100">
                        Spoonacular
                      </span>
                    )}
                  </div>
                </div>
                
                {renderRecipeMetadata()}
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-gray-700">
              <button 
                className={`px-6 py-3 font-medium text-sm ${activeTab === 'ingredients' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveTab('ingredients')}
              >
                Ingredients
              </button>
              <button 
                className={`px-6 py-3 font-medium text-sm ${activeTab === 'instructions' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveTab('instructions')}
              >
                Instructions
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              {activeTab === 'ingredients' && (
                <div>
                  <ul className="space-y-2">
                    {recipe.extendedIngredients.map((ingredient, i) => (
                      <li 
                        key={ingredient.id || `${i}-${ingredient.name}`}
                        className="flex items-start"
                      >
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-3"></span>
                        <span className="text-gray-300">{ingredient.original}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'instructions' && (
                <div className="prose prose-invert max-w-none prose-yellow prose-lg">
                  <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 mt-auto">
              <button
                onClick={handleOpenNutritionModal}
                className="w-full bg-yellow-500 text-gray-900 py-3 rounded-lg hover:bg-yellow-400 transition-colors font-medium flex items-center justify-center"
              >
                <Info size={18} className="mr-2" />
                Nutrition Details
              </button>
            </div>

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