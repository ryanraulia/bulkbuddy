import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // Import ThemeContext

const RecipeForm = ({ onClose }) => {
  const { darkMode } = useTheme(); // Get darkMode from ThemeContext
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
    dietType: 'all',
    cuisine: '',
    mealType: '',
    maxPrepTime: '',
    eggFree: false,
    peanutFree: false,
    soyFree: false,
    treeNutFree: false,
    shellfishFree: false,
    image: null,
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
      ingredients: [...formData.ingredients, { name: '', amount: '', unit: '' }],
    });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'ingredients') {
        data.append(key, JSON.stringify(value));
      } else if (key === 'image' && value) {
        data.append(key, value);
      } else {
        data.append(key, value);
      }
    });

    try {
      const response = await fetch('/api/recipes/submit', {
        method: 'POST',
        credentials: 'include',
        body: data,
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
    // Outer overlay with transparent background and blur
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Modal content container with gradient background */}
      <div className={`${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'} rounded-xl shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header with gradient overlay */}
        <div className={`relative p-6 ${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>Submit New Recipe</h2>
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full p-2 ${darkMode ? 'text-white' : 'text-gray-700'} hover:bg-opacity-90 hover:bg-red-600 transition-all z-10 shadow-lg`}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Recipe Title */}
          <div>
            <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Recipe Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
              placeholder="Enter recipe title"
            />
                    </div>
                    <label>
            Servings:
            <input 
              type="number" 
              value={formData.servings} 
              onChange={(e) => setFormData({...formData, servings: e.target.value})}
              min="1"
              required
            />
          </label>

          <label>
            Health Score (0-100):
            <input
              type="number"
              value={formData.healthScore}
              onChange={(e) => setFormData({...formData, healthScore: e.target.value})}
              min="0"
              max="100"
              required
            />
          </label>

          {/* Ingredients */}
          <div>
            <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Ingredients</label>
            {formData.ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  className={`flex-1 p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors duration-200`}
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  className={`w-20 p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors duration-200`}
                  required
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className={`w-20 p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors duration-200`}
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-[#007BFF] hover:text-blue-600'} text-sm flex items-center transition-colors duration-200`}
            >
              <span className="mr-1">+</span> Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              required
              className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none transition-colors duration-200`}
              rows="4"
              placeholder="Enter step-by-step instructions"
            />
          </div>

          {/* Nutritional Information */}
          <div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Nutritional Information</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Calories', name: 'calories' },
                { label: 'Protein (g)', name: 'protein' },
                { label: 'Fat (g)', name: 'fat' },
                { label: 'Carbs (g)', name: 'carbs' },
                { label: 'Sugar (g)', name: 'sugar' },
                { label: 'Fiber (g)', name: 'fiber' },
              ].map((field) => (
                <div key={field.name}>
                  <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 text-sm`}>{field.label}</label>
                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none text-sm transition-colors duration-200`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Diet Type, Cuisine, and Meal Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Diet Type</label>
              <select
                name="dietType"
                value={formData.dietType}
                onChange={handleInputChange}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
              >
                <option value="all">All</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="ketogenic">Ketogenic</option>
                <option value="pescetarian">Pescetarian</option>
              </select>
            </div>

            <div>
              <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Cuisine</label>
              <select
                name="cuisine"
                value={formData.cuisine}
                onChange={handleInputChange}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
              >
                <option value="">Select Cuisine</option>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Asian">Asian</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="American">American</option>
                <option value="Indian">Indian</option>
                <option value="French">French</option>
                <option value="Greek">Greek</option>
              </select>
            </div>

            <div>
              <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Meal Type</label>
              <select
                name="mealType"
                value={formData.mealType}
                onChange={handleInputChange}
                className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
              >
                <option value="">Select Meal Type</option>
                <option value="breakfast">Breakfast</option>
                <option value="main course">Main Course</option>
                <option value="side dish">Side Dish</option>
                <option value="appetizer">Appetizer</option>
                <option value="salad">Salad</option>
                <option value="soup">Soup</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>
          </div>

          {/* Max Prep Time */}
          <div>
            <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Max Prep Time (minutes)</label>
            <input
              type="number"
              name="maxPrepTime"
              value={formData.maxPrepTime}
              onChange={handleInputChange}
              className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
              placeholder="Enter maximum preparation time"
            />
          </div>

          {/* Vitamins and Minerals - Collapsible Section */}
          <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg p-4 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
            <details>
              <summary className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} cursor-pointer ${darkMode ? 'hover:text-blue-400' : 'hover:text-[#007BFF]'} transition-colors duration-200`}>
                Vitamins & Minerals (Optional)
              </summary>
              <div className="grid grid-cols-3 gap-4 mt-3">
                {[
                  { label: 'Vitamin B6 (mg)', name: 'vitamin_b6' },
                  { label: 'Folate (mcg)', name: 'folate' },
                  { label: 'Vitamin B12 (mcg)', name: 'vitamin_b12' },
                  { label: 'Vitamin C (mg)', name: 'vitamin_c' },
                  { label: 'Vitamin K (mcg)', name: 'vitamin_k' },
                  { label: 'Vitamin E (mg)', name: 'vitamin_e' },
                  { label: 'Vitamin A (IU)', name: 'vitamin_a' },
                  { label: 'Sodium (mg)', name: 'sodium' },
                  { label: 'Zinc (mg)', name: 'zinc' },
                  { label: 'Iron (mg)', name: 'iron' },
                  { label: 'Phosphorus (mg)', name: 'phosphorus' },
                  { label: 'Magnesium (mg)', name: 'magnesium' },
                  { label: 'Potassium (mg)', name: 'potassium' },
                  { label: 'Calcium (mg)', name: 'calcium' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 text-sm`}>{field.label}</label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus:border-blue-500 focus:outline-none text-sm transition-colors duration-200`}
                    />
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Dietary Information */}
          <div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Dietary Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Gluten-Free', name: 'glutenFree' },
                { label: 'Vegetarian', name: 'vegetarian' },
                { label: 'Vegan', name: 'vegan' },
                { label: 'Dairy-Free', name: 'dairyFree' },
                { label: 'Low FODMAP', name: 'lowFodmap' },
                { label: 'Sustainable', name: 'sustainable' },
                { label: 'Very Healthy', name: 'veryHealthy' },
                { label: 'Budget Friendly', name: 'budgetFriendly' },
                { label: 'Egg-Free', name: 'eggFree' },
                { label: 'Peanut-Free', name: 'peanutFree' },
                { label: 'Soy-Free', name: 'soyFree' },
                { label: 'Tree Nut-Free', name: 'treeNutFree' },
                { label: 'Shellfish-Free', name: 'shellfishFree' },
              ].map((field) => (
                <label
                  key={field.name}
                  className={`flex items-center space-x-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} hover:bg-opacity-50 p-2 rounded transition-colors duration-200`}
                >
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name]}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Image</label>
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${darkMode ? 'border-gray-600 hover:border-blue-400' : 'border-gray-300 hover:border-[#007BFF]'} ${darkMode ? 'bg-gray-700 bg-opacity-30 hover:bg-opacity-50' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-200`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, GIF (MAX. 5MB)</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </label>
            </div>
            {formData.image && (
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Selected file: {formData.image.name}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className={`${darkMode ? 'bg-red-900' : 'bg-red-100'} bg-opacity-70 ${darkMode ? 'text-white' : 'text-red-700'} p-3 rounded`}>
              <p>{error}</p>
            </div>
          )}

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className={`bg-[#007BFF] text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium transition-colors duration-200 flex-1`}
            >
              Submit Recipe
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-gray-700'} px-6 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300'} transition-colors duration-200 border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
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