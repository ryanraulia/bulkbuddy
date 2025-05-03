import React from "react";
import { useTheme } from '../context/ThemeContext';

export default function Tips() {
  const { darkMode } = useTheme();

  return (
<div className={`container mx-auto px-6 py-12 
  ${darkMode 
    ? 'bg-gradient-to-b from-[#1A1A1A] via-[#333333] to-[#1A1A1A] text-[#E0E0E0]' 
    : 'bg-gradient-to-b  from-gray-100 via-gray-50 to-gray-100 text-[#212529]'} 
`}>
      <h1 className={`text-4xl font-extrabold text-center mb-6 ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>
        Bulking Tips & Nutrition Advice
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tip 1 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>1. Eat in a Caloric Surplus</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            To promote muscle growth, consume more calories than your body expends daily. Learn more at <a href="https://www.healthline.com/nutrition/bulking" className="text-blue-400">Healthline</a>.
          </p>
        </div>

        {/* Tip 2 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>2. Prioritise Protein Intake</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Aim for 1.6–3.1g of protein per kg of body weight daily to support muscle repair and growth. Visit <a href="https://www.health.com/muscle-building-diet-plan-11695087" className="text-blue-400">Health.com</a> for more details.
          </p>
        </div>

        {/* Tip 3 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>3. Include Complex Carbohydrates</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Complex carbs provide sustained energy essential for workouts. Check out <a href="https://www.health.com/high-calorie-foods-8739626" className="text-blue-400">Health.com</a> for healthy carb choices.
          </p>
        </div>

        {/* Tip 4 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>4. Ensure Adequate Sleep & Recovery</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Muscle growth happens during rest. Aim for 7–9 hours of sleep per night. Get tips at <a href="https://www.verywellhealth.com/nutrition-mistakes-that-hinder-muscle-growth-8749716" className="text-blue-400">Verywell Health</a>.
          </p>
        </div>

        {/* Tip 5 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>5. Incorporate Healthy Fats</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Healthy fats support hormone production and overall health. Read more at <a href="https://www.health.com/high-calorie-foods-8739626" className="text-blue-400">Health.com</a>.
          </p>
        </div>

        {/* Tip 6 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>6. Engage in Regular Strength Training</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Focus on compound movements like squats and deadlifts to maximize muscle growth. Learn more at <a href="https://www.menshealth.com/fitness/a26114988/how-to-bulk/" className="text-blue-400">Men's Health</a>.
          </p>
        </div>

        {/* Tip 7 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>7. Stay Hydrated</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Proper hydration is vital for muscle function and recovery. Visit <a href="https://www.verywellhealth.com/nutrition-mistakes-that-hinder-muscle-growth-8749716" className="text-blue-400">Verywell Health</a> for hydration tips.
          </p>
        </div>

        {/* Tip 8 */}
        <div className={`${darkMode ? 'bg-[#2D2D2D] border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-lg border`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>8. Monitor Progress and Adjust</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
            Track your calorie intake, macros, and performance. Adjust as needed. See more at <a href="https://www.healthline.com/nutrition/bulking" className="text-blue-400">Healthline</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
