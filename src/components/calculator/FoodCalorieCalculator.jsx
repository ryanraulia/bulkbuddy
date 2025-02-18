// src/components/calculator/FoodCalorieCalculator.jsx
import React, { useState } from 'react';
import axios from 'axios';

const FoodCalorieCalculator = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-yellow-400 mb-2">Food Nutrition Calculator</h2>
      <p className="text-sm text-gray-400 mb-4">Please enter food and be specific (e.g., Chicken Breast)</p>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food (e.g. Banana)"
            className="flex-1 p-2 border border-gray-700 rounded text-white bg-gray-900 focus:ring-2 focus:ring-yellow-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-400 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 p-3 rounded bg-red-50 mb-4">{error}</div>
      )}

      <div className="text-sm text-gray-400 mb-4">Results count: {results.length}</div>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((food) => (
            <div key={food.fdcId} className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold text-yellow-400 mb-2">{food.description}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>Calories: {food.calories?.toFixed(1) || 'N/A'}</div>
                <div>Protein: {food.protein?.toFixed(1) || 'N/A'}g</div>
                <div>Carbs: {food.carbs?.toFixed(1) || 'N/A'}g</div>
                <div>Fat: {food.fat?.toFixed(1) || 'N/A'}g</div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && query && (
        <p className="text-gray-500 text-center py-4">No results found. Try a different search term.</p>
      )}
    </div>
  );
};

export default FoodCalorieCalculator;