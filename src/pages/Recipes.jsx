import React, { useState } from 'react';
import Layout from "../components/layout/Layout";
import RecipeCard from "../components/recipe/RecipeCard";

export default function Recipes() {
  // Temporary static recipes (Later, replace with API data)
  const [recipes, setRecipes] = useState([
    { id: 1, name: "Chicken & Rice", image: "/assets/chicken-rice.jpg" },
    { id: 2, name: "Beef Stir Fry", image: "/assets/beef-stir-fry.jpg" },
    { id: 3, name: "Salmon & Quinoa", image: "/assets/salmon-quinoa.jpg" },
    { id: 4, name: "Pasta & Meatballs", image: "/assets/pasta-meatballs.jpg" }
  ]);

  return (
    <Layout>
      <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen py-8 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-8">Recipes</h1>

          {/* Recipe Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
