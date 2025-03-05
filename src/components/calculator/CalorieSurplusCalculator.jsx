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
  const [warning, setWarning] = useState(null);

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
    
    // Reset warning
    setWarning(null);

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

    // Calculate maintenance calories
    const maintenance = bmr * activity;
    
    // Calculate calorie adjustment (7700 calories per kg)
    const requestedCalorieAdjustment = (weeklyChange * 7700) / 7;
    
    // Calculate target calories based on goal
    let totalCalories = goalType === 'surplus' 
      ? maintenance + requestedCalorieAdjustment 
      : maintenance - requestedCalorieAdjustment;
      
    // Track if we adjusted calories and by how much
    let adjustedCalories = false;
    let actualWeeklyChange = weeklyChange;
    
    // Check if deficit is too aggressive (more than 25% below maintenance)
    const maxHealthyDeficit = maintenance * 0.25;
    if (goalType === 'deficit' && requestedCalorieAdjustment > maxHealthyDeficit) {
      setWarning(`Your requested deficit of ${requestedCalorieAdjustment.toFixed(0)} calories is too aggressive. Maximum recommended deficit is ${maxHealthyDeficit.toFixed(0)} calories for healthy weight loss.`);
      
      if (totalCalories < maintenance - maxHealthyDeficit) {
        adjustedCalories = true;
        totalCalories = maintenance - maxHealthyDeficit;
        actualWeeklyChange = (maxHealthyDeficit * 7) / 7700;
      }
    }
    
    // Ensure minimum calories aren't too low
    const minCalories = gender === 'male' ? 1500 : 1200;
    if (totalCalories < minCalories) {
      adjustedCalories = true;
      const originalCalories = totalCalories;
      totalCalories = minCalories;
      
      // Recalculate actual weekly change based on the adjusted calories
      const actualDeficit = maintenance - minCalories;
      actualWeeklyChange = (actualDeficit * 7) / 7700;
      
      setWarning(`Calculated calories (${originalCalories.toFixed(0)}) were below the minimum recommended intake. Target calories have been adjusted to ${minCalories} calories, which will result in approximately ${actualWeeklyChange.toFixed(2)}kg ${goalType === 'deficit' ? 'loss' : 'gain'} per week instead of your target of ${weeklyChange}kg.`);
    }
    
    // Calculate actual calorie adjustment after any adjustments
    const actualCalorieAdjustment = goalType === 'surplus' 
      ? totalCalories - maintenance
      : maintenance - totalCalories;

    // Macro Breakdown: Fixed ratios for protein, fats, and carbs
    const protein = w * 2.2;  // Fixed at 2.2g/kg
    const fatPercentage = 0.25;  // Fixed at 25% of calories
    
    // Calculate macros
    const fatCalories = totalCalories * fatPercentage;
    const fat = fatCalories / 9;
    const carbCalories = totalCalories - (protein * 4 + fatCalories);
    const carbs = Math.max(0, carbCalories / 4);

    // Time to Goal Calculation: Computes weeks to reach goal weight
    const weightDifference = Math.abs(goalW - w);
    
    // Determine if the goal is actually achievable
    const isWeightLossGoal = goalW < w;
    const isWeightGainGoal = goalW > w;
    
    // Check if goal direction matches selected goal type
    if ((isWeightLossGoal && goalType === 'surplus') || 
        (isWeightGainGoal && goalType === 'deficit')) {
      setWarning(`Your goal weight and goal type don't match. You selected ${goalType === 'surplus' ? 'weight gain' : 'weight loss'} but your goal weight indicates ${isWeightLossGoal ? 'weight loss' : 'weight gain'}.`);
    }
    
    // Calculate weeks to goal based on actual weekly change
    const weeksToGoal = weightDifference / actualWeeklyChange;

    // Set the results state
    setResults({
      maintenance: maintenance.toFixed(0),
      totalCalories: totalCalories.toFixed(0),
      protein: protein.toFixed(0),
      fat: fat.toFixed(0),
      carbs: carbs.toFixed(0),
      weeksToGoal: weeksToGoal.toFixed(1),
      calorieAdjustment: actualCalorieAdjustment.toFixed(0),
      originalTargetChange: weeklyChange,
      actualWeeklyChange: actualWeeklyChange.toFixed(2),
      adjustedCalories: adjustedCalories
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
            Target {inputs.goalType === 'surplus' ? 'Gain' : 'Loss'} per Week (kg)
          </label>
          <input type="number" step="0.1" min="0.1" max="2" value={inputs.targetWeightChange}
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

      {warning && (
        <div className="mt-4 p-3 bg-yellow-800 text-yellow-200 rounded">
          <strong>Warning:</strong> {warning}
        </div>
      )}

      {results && (
        <div className="mt-6 space-y-3 text-white">
          <div className="text-lg font-semibold text-yellow-400">Results</div>
          <div>Maintenance Calories: <span className="float-right">{results.maintenance} kcal</span></div>
          <div>Target Calories: <span className="float-right">{results.totalCalories} kcal</span></div>
          <div>Daily {inputs.goalType === 'surplus' ? 'Surplus' : 'Deficit'}: 
            <span className="float-right">{results.calorieAdjustment} kcal</span></div>
          
          {results.adjustedCalories && (
            <div className="bg-gray-700 p-2 rounded mt-2">
              <div className="text-yellow-400">Adjusted Rate:</div>
              <div>Target: {results.originalTargetChange}kg per week</div>
              <div>Actual: {results.actualWeeklyChange}kg per week</div>
            </div>
          )}
          
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