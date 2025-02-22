// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [targetCalories, setTargetCalories] = useState('');
  const [diet, setDiet] = useState('');
  const [intolerances, setIntolerances] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const queryParams = new URLSearchParams({
        targetCalories: targetCalories,
      });
      
      if (diet) queryParams.append('diet', diet);
      if (intolerances.length > 0) queryParams.append('intolerances', intolerances.join(','));

      const response = await fetch(`http://localhost:5000/api/mealplan?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      navigate('/mealplan', { state: data });
    } catch (error) {
      console.error('Error fetching meal plan:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="border border-yellow-500 bg-gray-800 rounded-2xl shadow-2xl p-10 text-center max-w-xl w-full relative">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 px-4 py-1 rounded-full text-gray-900 font-bold text-sm shadow-lg">
          Start Your Bulk Today!
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-yellow-400">Welcome to BulkBuddy</h1>
        <p className="text-gray-300 text-lg">
          Gain muscle the right way! Use our Meal Plan Generator to start your bulking journey.
        </p>

        {/* Meal Plan Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Existing calorie input */}
          <input
            type="number"
            placeholder="Enter target calories (e.g., 2500)"
            value={targetCalories}
            onChange={(e) => setTargetCalories(e.target.value)}
            className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500 transition"
            required
          />

          {/* Dietary Preferences Dropdown */}
          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500 transition"
          >
            <option value="">Select Dietary Preference (Optional)</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten free">Gluten Free</option>
            <option value="ketogenic">Ketogenic</option>
            <option value="paleo">Paleo</option>
          </select>

          {/* Intolerances Checkboxes */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="text-yellow-400 mb-2">Dietary Restrictions (Optional)</h3>
            <div className="grid grid-cols-2 gap-2 text-left">
              {['dairy', 'egg', 'gluten', 'peanut', 'seafood', 'sesame', 'shellfish', 'soy', 'sulfite', 'tree nut'].map((intolerance) => (
                <label key={intolerance} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={intolerance}
                    checked={intolerances.includes(intolerance)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setIntolerances([...intolerances, e.target.value]);
                      } else {
                        setIntolerances(intolerances.filter(i => i !== e.target.value));
                      }
                    }}
                    className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-600 checked:bg-yellow-500 checked:border-yellow-500 focus:ring-yellow-500/50 focus:ring-2 transition-colors duration-200"
                  />
                  <span className="capitalize">{intolerance}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 text-gray-900 font-bold p-3 rounded-lg hover:bg-yellow-400 transition shadow-md"
          >
            Generate Meal Plan
          </button>
        </form>
      </div>
    </div>
  );
}