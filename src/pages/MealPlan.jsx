// src/pages/MealPlan.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Layout from "../components/layout/Layout.jsx";

export default function MealPlan() {
  const location = useLocation();
  const mealPlanData = location.state;

  if (!mealPlanData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>No meal plan data found. Please generate a meal plan first.</p>
        </div>
      </Layout>
    );
  }

  // Assuming Edamam returns an object with `meals` (an array of meals)
  // and `nutrients` (an object with nutritional summary)
  const { meals, nutrients } = mealPlanData;

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Your Meal Plan</h1>

        {nutrients && (
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Nutritional Info</h2>
            <p>Calories: {nutrients.calories}</p>
            <p>Protein: {nutrients.protein}g</p>
            <p>Fat: {nutrients.fat}g</p>
            <p>Carbs: {nutrients.carbs}g</p>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-2">Meals</h2>
          {meals && meals.length > 0 ? (
            meals.map((meal, index) => (
              <div key={index} className="border rounded p-4 mb-4">
                <h3 className="text-xl font-bold">{meal.title}</h3>
                {/* Depending on the API response, you might show additional details */}
                <p>Ready in {meal.readyInMinutes} minutes</p>
                <p>Servings: {meal.servings}</p>
                {meal.sourceUrl && (
                  <a href={meal.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    View Recipe
                  </a>
                )}
              </div>
            ))
          ) : (
            <p>No meals available.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
