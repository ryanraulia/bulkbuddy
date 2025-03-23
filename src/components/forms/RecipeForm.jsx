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
    sugar: '',
    fiber: '',
    vitamin_b6: '',
    folate: '',
    vitamin_b12: '',
    vitamin_c: '',
    vitamin_k: '',
    vitamin_e: '',
    vitamin_a: '',
    sodium: '',
    zinc: '',
    iron: '',
    phosphorus: '',
    magnesium: '',
    potassium: '',
    calcium: '',
    glutenFree: false,
    vegetarian: false,
    vegan: false,
    dairyFree: false,
    lowFodmap: false,
    sustainable: false,
    veryHealthy: false,
    budgetFriendly: false,
    image: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
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
    data.append('sugar', formData.sugar);
    data.append('fiber', formData.fiber);
    data.append('vitamin_b6', formData.vitamin_b6);
    data.append('folate', formData.folate);
    data.append('vitamin_b12', formData.vitamin_b12);
    data.append('vitamin_c', formData.vitamin_c);
    data.append('vitamin_k', formData.vitamin_k);
    data.append('vitamin_e', formData.vitamin_e);
    data.append('vitamin_a', formData.vitamin_a);
    data.append('sodium', formData.sodium);
    data.append('zinc', formData.zinc);
    data.append('iron', formData.iron);
    data.append('phosphorus', formData.phosphorus);
    data.append('magnesium', formData.magnesium);
    data.append('potassium', formData.potassium);
    data.append('calcium', formData.calcium);
    data.append('glutenFree', formData.glutenFree);
    data.append('vegetarian', formData.vegetarian);
    data.append('vegan', formData.vegan);
    data.append('dairyFree', formData.dairyFree);
    data.append('lowFodmap', formData.lowFodmap);
    data.append('sustainable', formData.sustainable);
    data.append('veryHealthy', formData.veryHealthy);
    data.append('budgetFriendly', formData.budgetFriendly);
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
          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <label className="block text-gray-300 mb-2">Sugar (g)</label>
              <input
                type="number"
                name="sugar"
                value={formData.sugar}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Fiber (g)</label>
              <input
                type="number"
                name="fiber"
                value={formData.fiber}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Vitamin B6 (mg)</label>
              <input
                type="number"
                name="vitamin_b6"
                value={formData.vitamin_b6}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Folate (mcg)</label>
              <input
                type="number"
                name="folate"
                value={formData.folate}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Vitamin B12 (mcg)</label>
              <input
                type="number"
                name="vitamin_b12"
                value={formData.vitamin_b12}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Vitamin C (mg)</label>
              <input
                type="number"
                name="vitamin_c"
                value={formData.vitamin_c}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Vitamin K (mcg)</label>
              <input
                type="number"
                name="vitamin_k"
                value={formData.vitamin_k}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Vitamin E (mg)</label>
              <input
                type="number"
                name="vitamin_e"
                value={formData.vitamin_e}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Vitamin A (IU)</label>
              <input
                type="number"
                name="vitamin_a"
                value={formData.vitamin_a}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Sodium (mg)</label>
              <input
                type="number"
                name="sodium"
                value={formData.sodium}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Zinc (mg)</label>
              <input
                type="number"
                name="zinc"
                value={formData.zinc}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Iron (mg)</label>
              <input
                type="number"
                name="iron"
                value={formData.iron}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Phosphorus (mg)</label>
              <input
                type="number"
                name="phosphorus"
                value={formData.phosphorus}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Magnesium (mg)</label>
              <input
                type="number"
                name="magnesium"
                value={formData.magnesium}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Potassium (mg)</label>
              <input
                type="number"
                name="potassium"
                value={formData.potassium}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Calcium (mg)</label>
              <input
                type="number"
                name="calcium"
                value={formData.calcium}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
          </div>

          {/* Dietary Information */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="glutenFree"
                checked={formData.glutenFree}
                onChange={handleCheckboxChange}
              />
              <span className="text-gray-300">Gluten-Free</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="vegetarian"
                checked={formData.vegetarian}
                onChange={handleCheckboxChange}
              />
              <span className="text-gray-300">Vegetarian</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="vegan"
                checked={formData.vegan}
                onChange={handleCheckboxChange}
              />
              <span className="text-gray-300">Vegan</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="dairyFree"
                checked={formData.dairyFree}
                onChange={handleCheckboxChange}
              />
              <span className="text-gray-300">Dairy-Free</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="lowFodmap"
                checked={formData.lowFodmap}
                onChange={handleCheckboxChange}
              />
              <span className="text-gray-300">Low FODMAP</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="sustainable"
                checked={formData.sustainable}
                onChange={handleCheckboxChange}
              />
              <span className="text-gray-300">Sustainable</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="veryHealthy"
                checked={formData.veryHealthy}
                onChange={handleCheckboxChange}
              />
              <span className="text-gray-300">Very Healthy</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="budgetFriendly"
                checked={formData.budgetFriendly}
                onChange={handleCheckboxChange}
              />
              <span className="text-gray-300">Budget Friendly</span>
            </label>
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