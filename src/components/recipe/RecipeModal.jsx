import React from 'react';
import axios from 'axios';

const RecipeModal = ({ recipeId, onClose }) => {
  const [recipe, setRecipe] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`/api/recipe/${recipeId}`);
        setRecipe(response.data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

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
              <h2 className="text-2xl font-bold text-yellow-400">{recipe.title}</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>
            
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-64 object-cover rounded-lg mb-4"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1">
                  {recipe.extendedIngredients.map(ingredient => (
                    <li key={ingredient.id} className="text-gray-300">
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
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeModal;