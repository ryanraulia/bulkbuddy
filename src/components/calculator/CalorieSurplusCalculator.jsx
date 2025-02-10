import React, { useState } from 'react';

export default function CalorieSurplusCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('1.2'); // Default: Sedentary
  const [calories, setCalories] = useState(null);
  const [protein, setProtein] = useState(null);
  const [fats, setFats] = useState(null);
  const [carbs, setCarbs] = useState(null);

  const calculateCaloriesAndMacros = () => {
    if (!age || !weight || !height) {
      alert("Please fill out all fields.");
      return;
    }

    // Convert values to numbers
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    // BMR Calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === 'male') {
      bmr = 88.36 + (13.4 * w) + (4.8 * h) - (5.7 * a);
    } else {
      bmr = 447.6 + (9.2 * w) + (3.1 * h) - (4.3 * a);
    }

    // Multiply by activity level
    const maintenanceCalories = bmr * parseFloat(activityLevel);

    // Add surplus (e.g., 500 kcal for weight gain)
    const surplusCalories = maintenanceCalories + 500;

    // Set calorie surplus state
    setCalories(surplusCalories.toFixed(2));

    // Macronutrient Calculations
    // Protein: 2 grams per kg of body weight
    const proteinAmount = w * 2;
    // Fats: 25% of total calories
    const fatAmount = (surplusCalories * 0.25) / 9; // 9 calories per gram of fat
    // Carbs: Remaining calories
    const carbAmount = (surplusCalories - (proteinAmount * 4 + fatAmount * 9)) / 4; // 4 calories per gram of carbs

    setProtein(proteinAmount.toFixed(2));
    setFats(fatAmount.toFixed(2));
    setCarbs(carbAmount.toFixed(2));
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Calorie Surplus Calculator</h2>

      <div className="mb-3">
        <label className="block font-semibold">Age:</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 border rounded" />
      </div>

      <div className="mb-3">
        <label className="block font-semibold">Weight (kg):</label>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border rounded" />
      </div>

      <div className="mb-3">
        <label className="block font-semibold">Height (cm):</label>
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full p-2 border rounded" />
      </div>

      <div className="mb-3">
        <label className="block font-semibold">Gender:</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border rounded">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block font-semibold">Activity Level:</label>
        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full p-2 border rounded">
          <option value="1.2">Sedentary (Little to no exercise)</option>
          <option value="1.375">Light (1-3 days per week)</option>
          <option value="1.55">Moderate (3-5 days per week)</option>
          <option value="1.725">Active (6-7 days per week)</option>
          <option value="1.9">Very Active (Twice per day, intense)</option>
        </select>
      </div>

      <button onClick={calculateCaloriesAndMacros} className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600">
        Calculate Surplus Calories & Macros
      </button>

      {calories && (
        <div className="mt-4 p-4 bg-green-100 rounded text-center">
          <p className="font-semibold">To gain weight, aim for:</p>
          <p className="text-2xl font-bold">{calories} kcal/day</p>
          <p className="mt-2">Protein: {protein} grams</p>
          <p className="mt-2">Fats: {fats} grams</p>
          <p className="mt-2">Carbs: {carbs} grams</p>
        </div>
      )}
    </div>
  );
}
