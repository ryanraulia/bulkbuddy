import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeModal from "../components/recipe/RecipeModal";
import { useTheme } from '../context/ThemeContext';

export default function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');

  const [results, setResults] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('/api/recipes/search', {
          params: Object.fromEntries(new URLSearchParams(location.search))
        });
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search]);

  // Early return for empty search state
  if (!loading && !query && !location.search.includes('=')) {
    return (
      <div className={`min-h-screen py-8 ${darkMode ? 'bg-[#121212]' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className={`text-2xl mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Try searching for recipes or applying filters to get started!
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gradient-to-b from-[#121212] via-[#181818] to-[#121212]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Conditional heading */}
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} mb-6`}>
          {query ? `Search Results for "${query}"` : 'Filtered Recipes'}
        </h1>

        {/* Filter Display */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(Object.fromEntries(new URLSearchParams(location.search))).map(([key, value]) => {
            if (key === 'q' || !value) return null;
            return (
              <span 
                key={key}
                className={`px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {key}: {value}
              </span>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-4">
            <p className={`text-lg animate-pulse ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>Loading results...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={setSelectedRecipe}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            {query ? `No results found for "${query}". Try a different search term.` : 'No recipes found matching the filters'}
          </div>
        )}

        {selectedRecipe && (
          <RecipeModal
            recipeId={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </div>
    </div>
  );
}