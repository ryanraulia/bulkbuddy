// src/pages/MealPlan.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Layout from "../components/layout/Layout.jsx";

export default function MealPlan() {
  const location = useLocation();
  const mealPlanData = location.state;

  console.log("Meal plan data received:", mealPlanData);

  // Check if we have either a "plan" or a "selection" property.
  if (!mealPlanData || (!mealPlanData.plan && !mealPlanData.selection)) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>No meal plan data found. Please generate a meal plan first.</p>
        </div>
      </Layout>
    );
  }

  // If the API returned a "plan" property, use it; otherwise, check for "selection".
  let sections = null;
  if (mealPlanData.plan) {
    sections = mealPlanData.plan.sections;
  } else if (mealPlanData.selection && mealPlanData.selection.length > 0) {
    sections = mealPlanData.selection[0].sections;
  }

  if (!sections) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>No sections found in the meal plan data.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Your Meal Plan</h1>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Meals</h2>
          {Object.keys(sections).map((sectionKey, index) => {
            const section = sections[sectionKey];
            return (
              <div key={index} className="border rounded p-4 mb-4">
                <h3 className="text-xl font-bold">{sectionKey}</h3>
                {section.assigned ? (
                  <p>Assigned Recipe URI: {section.assigned}</p>
                ) : (
                  <p>No recipe assigned for this section.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
