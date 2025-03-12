import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const FoodCalorieCalculator = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { darkMode } = useTheme();

  const searchFood = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      const response = await axios.get('/api/food', { params: { q: query } });
      if (Array.isArray(response.data)) {
        setResults(response.data);
      } else if (response.data.foods) {
        setResults(response.data.foods);
      } else {
        setError('Unexpected data format received');
        setResults([]);
      }
    } catch (err) {
      setError(`Error fetching food data: ${err.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchFood();
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded-lg shadow-lg mb-8 ${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-2`}>Food Nutrition Calculator</h2>
      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Please enter food and be specific (e.g., Chicken Breast)</p>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food (e.g. Banana)"
            className={`flex-1 p-2 border rounded ${darkMode ? 'border-gray-700 text-[#E0E0E0] bg-[#1E1E1E]' : 'border-gray-300 text-[#212529] bg-white'}`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#007BFF] hover:bg-[#0056b3]'} text-white px-4 py-2 rounded transition-colors duration-200 disabled:bg-gray-400`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className={`p-3 rounded mb-4 ${darkMode ? 'bg-red-800 text-red-200' : 'bg-red-50 text-red-500'}`}>{error}</div>
      )}

      <div className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Results count: {results.length}</div>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((food) => (
            <div key={food.fdcId} className={`p-4 rounded ${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-2`}>{food.description}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Calories: {food.calories?.toFixed(1) || 'N/A'}</div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Protein: {food.protein?.toFixed(1) || 'N/A'}g</div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Carbs: {food.carbs?.toFixed(1) || 'N/A'}g</div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fat: {food.fat?.toFixed(1) || 'N/A'}g</div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && query && (
        <p className={`text-center py-4 ${darkMode ? 'text-gray-500' : 'text-gray-700'}`}>No results found. Try a different search term.</p>
      )}
    </div>
  );
};

export default FoodCalorieCalculator;