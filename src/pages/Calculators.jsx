import React from 'react';
import CalorieSurplusCalculator from '../components/calculator/CalorieSurplusCalculator';
import FoodCalorieCalculator from '../components/calculator/FoodCalorieCalculator';
import { useTheme } from '../context/ThemeContext';

export default function Calculators() {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gradient-to-b from-[#1A1A1A] via-[#333333] to-[#1A1A1A]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'} ${darkMode ? 'text-[#E0E0E0]' : 'text-[#212529]'}`}>
      <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-extrabold text-center text-[#007BFF] mb-6">Calculators</h1>
              <div className="space-y-8">
          <FoodCalorieCalculator />
          <CalorieSurplusCalculator />
        </div>
      </div>
    </div>
  );
}