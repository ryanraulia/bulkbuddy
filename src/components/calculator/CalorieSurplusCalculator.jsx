import React, { useState } from 'react';

export default function CalorieSurplusCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('1.2');
  const [calories, setCalories] = useState(null);
  const [protein, setProtein] = useState(null);
  const [fats, setFats] = useState(null);
  const [carbs, setCarbs] = useState(null);

  const calculateCaloriesAndMacros = () => {
    if (!age || !weight || !height) {
      alert("Please fill out all fields.");
      return;
    }

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    let bmr;
    if (gender === 'male') {
      bmr = 88.36 + (13.4 * w) + (4.8 * h) - (5.7 * a);
    } else {
      bmr = 447.6 + (9.2 * w) + (3.1 * h) - (4.3 * a);
    }

    const maintenanceCalories = bmr * parseFloat(activityLevel);
    const surplusCalories = maintenanceCalories + 500;

    setCalories(surplusCalories.toFixed(2));

    const proteinAmount = w * 2;
    const fatAmount = (surplusCalories * 0.25) / 9;
    const carbAmount = (surplusCalories - (proteinAmount * 4 + fatAmount * 9)) / 4;

    setProtein(proteinAmount.toFixed(2));
    setFats(fatAmount.toFixed(2));
    setCarbs(carbAmount.toFixed(2));
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">Calorie Surplus Calculator</h2>

      <div className="mb-3">
        <label className="block font-semibold text-white">Age:</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900" />
      </div>

      <div className="mb-3">
        <label className="block font-semibold text-white">Weight (kg):</label>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900" />
      </div>

      <div className="mb-3">
        <label className="block font-semibold text-white">Height (cm):</label>
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900" />
      </div>

      <div className="mb-3">
        <label className="block font-semibold text-white">Gender:</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block font-semibold text-white">Activity Level:</label>
        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900">
          <option value="1.2">Sedentary</option>
          <option value="1.375">Light</option>
          <option value="1.55">Moderate</option>
          <option value="1.725">Active</option>
          <option value="1.9">Very Active</option>
        </select>
      </div>

      <button onClick={calculateCaloriesAndMacros} className="w-full bg-yellow-500 text-gray-900 py-2 rounded mt-4 hover:bg-yellow-400">
        Calculate Surplus Calories & Macros
      </button>

      {calories && (
        <div className="mt-6 space-y-4">
          <div className="text-white">Calories: {calories} kcal</div>
          <div className="text-white">Protein: {protein} g</div>
          <div className="text-white">Fats: {fats} g</div>
          <div className="text-white">Carbs: {carbs} g</div>
        </div>
      )}
    </div>
  );
}
