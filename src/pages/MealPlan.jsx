import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from "../components/layout/Layout.jsx";

export default function MealPlan() {
  const location = useLocation();
  const mealPlanData = location.state;
  const [recipes, setRecipes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecipeDetails() {
      if (!mealPlanData?.selection?.[0]?.sections) {
        setLoading(false);
        setError("No meal plan data available");
        return;
      }

      try {
        const newRecipes = {};
        const backendUrl = "http://localhost:5000";
        const sections = mealPlanData.selection[0].sections;
        
        for (const [sectionKey, section] of Object.entries(sections)) {
          if (!section.assigned) {
            console.log(`No assigned recipe for ${sectionKey}`);
            continue;
          }

          try {
            const url = `${backendUrl}/api/lookup?recipeURI=${encodeURIComponent(section.assigned)}`;
            console.log(`Fetching recipe for ${sectionKey} from:`, url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Received data for ${sectionKey}:`, data);
            
            if (Array.isArray(data) && data.length > 0) {
              newRecipes[sectionKey] = data[0];
              console.log(`Successfully added recipe for ${sectionKey}`);
            } else {
              console.error(`Invalid data format for ${sectionKey}`);
            }
          } catch (error) {
            console.error(`Error fetching details for ${sectionKey}:`, error);
          }
        }

        if (Object.keys(newRecipes).length === 0) {
          setError("No recipes could be loaded. Please try again.");
        } else {
          setRecipes(newRecipes);
        }
      } catch (error) {
        console.error("Error in fetchRecipeDetails:", error);
        setError("Failed to fetch recipe details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipeDetails();
  }, [mealPlanData]);

  return (
    <Layout>
      <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen py-8 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-8">Your Meal Plan</h1>
          
          {loading && (
            <div className="flex items-center justify-center p-4">
              <p className="text-lg animate-pulse text-yellow-400">Loading your meal plan...</p>
            </div>
          )}

          {error && (
            <div className="text-red-500 p-4 mb-4 bg-red-100 rounded">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(recipes).map(([sectionKey, recipeDetail]) => (
              <div key={sectionKey} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition">
                <h3 className="text-xl font-bold mb-3 text-yellow-400">{sectionKey}</h3>
                <div className="space-y-3">
                  {recipeDetail.image && (
                    <img
                      src={recipeDetail.image}
                      alt={recipeDetail.label}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <h4 className="text-lg font-semibold text-yellow-400">{recipeDetail.label}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Calories:</span>
                    <span>{Math.round(recipeDetail.calories)}</span>
                  </div>
                  {recipeDetail.ingredientLines && (
                    <div>
                      <h5 className="font-medium mb-2">Ingredients:</h5>
                      <ul className="list-disc ml-5 space-y-1">
                        {recipeDetail.ingredientLines.map((line, i) => (
                          <li key={i} className="text-gray-300">{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}