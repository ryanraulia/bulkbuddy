import React from 'react';
import CalorieSurplusCalculator from '../components/calculator/CalorieSurplusCalculator';
import FoodCalorieCalculator from '../components/calculator/FoodCalorieCalculator';
import { useTheme } from '../context/ThemeContext';

export default function Calculators() {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gradient-to-b from-[#121212] via-[#181818] to-[#121212]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'} ${darkMode ? 'text-[#E0E0E0]' : 'text-[#212529]'}`}>
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