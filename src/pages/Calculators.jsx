// src/pages/Calculators.jsx
import React from 'react';
import Layout from '../components/layout/Layout';
import CalorieSurplusCalculator from '../components/calculator/CalorieSurplusCalculator';
import FoodCalorieCalculator from '../components/calculator/FoodCalorieCalculator';

export default function Calculators() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Calculators</h1>
        
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Food Calorie Calculator */}
          <FoodCalorieCalculator />
          
          {/* Calorie Surplus Calculator */}
          <CalorieSurplusCalculator />
        </div>
      </div>
    </Layout>
  );
}