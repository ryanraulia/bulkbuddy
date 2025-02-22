import React, { useState } from 'react';

export default function CalorieCalculator() {
  // State Management: Manage user inputs and calculated results
  const [inputs, setInputs] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: '1.2',
    goalType: 'surplus',
    targetWeightChange: '0.5',
    goalWeight: '',
    bodyFat: ''
  });

  const [results, setResults] = useState(null);

  // Activity levels for the dropdown
  const activityLevels = [
    { value: '1.2', label: 'Sedentary (little/no exercise)' },
    { value: '1.375', label: 'Light (exercise 1-3 days/week)' },
    { value: '1.55', label: 'Moderate (exercise 3-5 days/week)' },
    { value: '1.725', label: 'Active (exercise 6-7 days/week)' },
    { value: '1.9', label: 'Very Active (hard exercise & physical job)' }
  ];

  // Validation: Ensure required fields are filled
  const validateInputs = () => {
    const required = ['age', 'weight', 'height', 'goalWeight'];
    for (const field of required) {
      if (!inputs[field]) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  // Calculate results based on user inputs
  const calculateResults = () => {
    if (!validateInputs()) return;

    const {
      age, weight, height, gender, activityLevel,
      goalType, targetWeightChange, goalWeight, bodyFat
    } = inputs;

    // Convert inputs to numbers
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    const bf = parseFloat(bodyFat);
    const activity = parseFloat(activityLevel);
    const weeklyChange = parseFloat(targetWeightChange);
    const goalW = parseFloat(goalWeight);

    // BMR Calculation: Uses either the Mifflin-St Jeor formula or the Katch-McArdle formula
    let bmr;
    if (bf) {
      const leanMass = w * (1 - bf/100);
      bmr = 370 + (21.6 * leanMass);
    } else {
      bmr = gender === 'male' 
        ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
        : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }

    // Calculate calorie needs
    const maintenance = bmr * activity;
    const calorieAdjustment = (weeklyChange * 7700) / 7;
    const totalCalories = goalType === 'surplus' 
      ? maintenance + calorieAdjustment 
      : maintenance - calorieAdjustment;

    // Macro Breakdown: Fixed ratios for protein, fats, and carbs
    const protein = w * 2.2;  // Fixed at 2.2g/kg
    const fatPercentage = 0.25;  // Fixed at 25% of calories
    
    // Calculate macros
    const fatCalories = totalCalories * fatPercentage;
    const fat = fatCalories / 9;
    const carbCalories = totalCalories - (protein * 4 + fatCalories);
    const carbs = carbCalories / 4;

    // Time to Goal Calculation: Computes weeks to reach goal weight
    const weightDifference = goalType === 'surplus' 
      ? goalW - w 
      : w - goalW;
    const weeksToGoal = weightDifference / weeklyChange;

    // Set the results state
    setResults({
      maintenance: maintenance.toFixed(0),
      totalCalories: totalCalories.toFixed(0),
      protein: protein.toFixed(0),
      fat: fat.toFixed(0),
      carbs: carbs.toFixed(0),
      weeksToGoal: weeksToGoal.toFixed(1),
      calorieAdjustment: Math.abs(calorieAdjustment).toFixed(0)
    });
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">Calorie Calculator</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold text-white mb-1">Age</label>
          <input type="number" value={inputs.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900" />
        </div>

        <div>
          <label className="block font-semibold text-white mb-1">Weight (kg)</label>
          <input type="number" value={inputs.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900" />
        </div>

        <div>
          <label className="block font-semibold text-white mb-1">Height (cm)</label>
          <input type="number" value={inputs.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900" />
        </div>

        <div>
          <label className="block font-semibold text-white mb-1">Body Fat (%)</label>
          <input type="number" value={inputs.bodyFat}
            onChange={(e) => handleInputChange('bodyFat', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900"
            placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold text-white mb-1">Gender</label>
          <select value={inputs.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-white mb-1">Activity Level</label>
          <select value={inputs.activityLevel}
            onChange={(e) => handleInputChange('activityLevel', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900">
            {activityLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-white mb-1">Goal</label>
          <select value={inputs.goalType}
            onChange={(e) => handleInputChange('goalType', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900">
            <option value="surplus">Weight Gain</option>
            <option value="deficit">Weight Loss</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-white mb-1">
            Target Weight Change ({inputs.goalType === 'surplus' ? 'Gain' : 'Loss'}) per Week (kg)
          </label>
          <input type="number" step="0.1" value={inputs.targetWeightChange}
            onChange={(e) => handleInputChange('targetWeightChange', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900" />
        </div>

        <div>
          <label className="block font-semibold text-white mb-1">Goal Weight (kg)</label>
          <input type="number" value={inputs.goalWeight}
            onChange={(e) => handleInputChange('goalWeight', e.target.value)}
            className="w-full p-2 border border-gray-700 rounded text-white bg-gray-900" />
        </div>
      </div>

      <button onClick={calculateResults}
        className="w-full bg-yellow-500 text-gray-900 py-2 rounded mt-6 hover:bg-yellow-400 font-semibold">
        Calculate
      </button>

      {results && (
        <div className="mt-6 space-y-3 text-white">
          <div className="text-lg font-semibold text-yellow-400">Results</div>
          <div>Maintenance Calories: <span className="float-right">{results.maintenance} kcal</span></div>
          <div>Target Calories: <span className="float-right">{results.totalCalories} kcal</span></div>
          <div>Daily {inputs.goalType === 'surplus' ? 'Surplus' : 'Deficit'}: 
            <span className="float-right">{results.calorieAdjustment} kcal</span></div>
          <div className="pt-3 border-t border-gray-700">
            Protein (2.2g/kg): <span className="float-right">{results.protein}g</span>
          </div>
          <div>Fats (25%): <span className="float-right">{results.fat}g</span></div>
          <div>Carbs: <span className="float-right">{results.carbs}g</span></div>
          <div className="pt-3 border-t border-gray-700">
            Time to Reach Goal: <span className="float-right">{results.weeksToGoal} weeks</span>
          </div>
        </div>
      )}
    </div>
  );
}