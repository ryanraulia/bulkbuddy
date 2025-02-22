import React from 'react';
import CalorieSurplusCalculator from '../components/calculator/CalorieSurplusCalculator';
import FoodCalorieCalculator from '../components/calculator/FoodCalorieCalculator';

export default function Calculators() {
  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen py-8 text-white">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-6">Calculators</h1>
        <div className="space-y-8">
          <FoodCalorieCalculator />
          <CalorieSurplusCalculator />
        </div>
      </div>
    </div>
  );
}