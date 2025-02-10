// src/pages/Home/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../components/layout/Layout.jsx";

export default function Home() {
  const [targetCalories, setTargetCalories] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call your backend (adjust the URL if needed)
      const response = await fetch(`http://localhost:5000/api/mealplan?targetCalories=${targetCalories}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // Navigate to the MealPlan page, passing the API data in state
      navigate('/mealplan', { state: data });
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="border-4 border-gray-300 rounded-lg p-8 text-center max-w-xl w-full">
          <h1 className="text-3xl font-bold mb-4 max-w-xl mx-auto">Welcome to BulkBuddy</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Welcome to Bulk Buddy, the hub to help you gain weight healthily! Below is our Meal Plan Generator—use it to kickstart your journey toward effective weight gain!
          </p>
          {/* Meal Plan Form */}
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="number"
              placeholder="Enter target calories (e.g., 2000)"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              className="border p-2 rounded mb-2 w-full"
              required
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
              Generate Meal Plan
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
