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
        const response = await axios.get(`/api/recipes/search?query=${query}`);
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gradient-to-b from-[#121212] via-[#181818] to-[#121212]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'} ${darkMode ? 'text-[#E0E0E0]' : 'text-[#212529]'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">
          Search Results for "{query}"
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={setSelectedRecipe}
            />
          ))}
        </div>

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