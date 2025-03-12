import React from "react";
import { useTheme } from '../context/ThemeContext';

export default function Tips() {
  const { darkMode } = useTheme();

  return (
    <div className={`container mx-auto px-6 py-12 ${darkMode ? 'bg-[#1E1E1E]' : 'bg-[#FAFAFA]'}`}>
      <h1 className={`text-4xl font-extrabold text-center mb-6 ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>
        Bulking Tips & Nutrition Advice
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tip 1 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>1. Eat in a Caloric Surplus</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            To gain muscle, consume more calories than you burn. Use our{" "}
            <span className={`${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} font-semibold`}>calorie calculator</span> to find your optimal intake.
          </p>
        </div>

        {/* Tip 2 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>2. Prioritize Protein Intake</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Aim for at least 1g of protein per pound of body weight. High-protein meals will optimize muscle growth.
          </p>
        </div>

        {/* Tip 3 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>3. Train with Progressive Overload</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Increase weights, reps, or sets over time to keep challenging your muscles and stimulate growth.
          </p>
        </div>

        {/* Tip 4 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>4. Get Enough Sleep & Recovery</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Your muscles grow while you rest. Aim for 7-9 hours of sleep per night for optimal recovery.
          </p>
        </div>
      </div>
    </div>
  );
}