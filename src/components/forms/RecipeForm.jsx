import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecipeForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    image: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', amount: '', unit: '' }]
    });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('instructions', formData.instructions);
    data.append('calories', formData.calories);
    data.append('protein', formData.protein);
    data.append('fat', formData.fat);
    data.append('carbs', formData.carbs);
    if (formData.image) {
      data.append('image', formData.image);
    }
    data.append('ingredients', JSON.stringify(formData.ingredients));

    try {
      const response = await fetch('/api/recipes/submit', {
        method: 'POST',
        credentials: 'include',
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      onClose();
      navigate('/recipes');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Submit New Recipe</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipe Title */}
          <div>
            <label className="block text-gray-300 mb-2">Recipe Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-gray-300 mb-2">Ingredients</label>
            {formData.ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  className="flex-1 p-2 rounded bg-gray-700 text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  className="w-20 p-2 rounded bg-gray-700 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="w-20 p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="text-yellow-400 hover:text-yellow-300 text-sm"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-gray-300 mb-2">Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
              rows="4"
            />
          </div>

          {/* Nutritional Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Calories</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Protein (g)</label>
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Fat (g)</label>
              <input
                type="number"
                name="fat"
                value={formData.fat}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Carbs (g)</label>
              <input
                type="number"
                name="carbs"
                value={formData.carbs}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-300 mb-2">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              accept="image/*"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500">{error}</p>}

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-400"
            >
              Submit Recipe
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;