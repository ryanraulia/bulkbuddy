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
    setResults([]); // Clear previous results
    
    try {
      console.log('Sending request for:', query);
      const response = await axios.get('/api/food', {
        params: { q: query }
      });
      
      console.log('API Response:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      // If the response is directly an array
      if (Array.isArray(response.data)) {
        setResults(response.data);
      }
      // If the response has a foods property (based on your backend code)
      else if (response.data.foods && Array.isArray(response.data.foods)) {
        setResults(response.data.foods);
      }
      // If we get an unexpected response format
      else {
        console.error('Unexpected API response format:', response.data);
        setError('Unexpected data format received');
        setResults([]);
      }

    } catch (err) {
      console.error('API Error:', err);
      console.error('Error details:', err.response?.data);
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
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Food Nutrition Calculator</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food (e.g. Banana)"
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 p-3 rounded bg-red-50 mb-4">
          {error}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4">
        Results count: {results.length}
      </div>

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((food) => (
            <div key={food.fdcId} className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">{food.description}</h3>
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
        <p className="text-gray-500 text-center py-4">
          No results found. Try a different search term.
        </p>
      )}
    </div>
  );
};

export default FoodCalorieCalculator;