import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function CalorieCalculator() {
  const { darkMode } = useTheme();

  const [inputs, setInputs] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: '1.2',
    goalType: 'surplus',
    targetWeightChange: '0.25',
    goalWeight: '',
    bodyFat: ''
  });

  const [results, setResults] = useState(null);
  const [warning, setWarning] = useState(null);

  const activityLevels = [
    { value: '1.2', label: 'Sedentary (little/no exercise)' },
    { value: '1.375', label: 'Light (exercise 1-3 days/week)' },
    { value: '1.55', label: 'Moderate (exercise 3-5 days/week)' },
    { value: '1.725', label: 'Active (exercise 6-7 days/week)' },
    { value: '1.9', label: 'Very Active (hard exercise & physical job)' }
  ];

  const weightChangeOptions = {
    surplus: [
      { value: '0.1', label: '0.1 kg/week (Slow)' },
      { value: '0.25', label: '0.25 kg/week (Moderate)' },
      { value: '0.5', label: '0.5 kg/week (Aggressive)' }
    ],
    deficit: [
      { value: '0.25', label: '0.25 kg/week (Slow)' },
      { value: '0.5', label: '0.5 kg/week (Moderate)' },
      { value: '0.75', label: '0.75 kg/week (Fast)' },
      { value: '1.0', label: '1.0 kg/week (Aggressive)' }
    ]
  };

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

  const handleInputChange = (field, value) => {
    if (field === 'goalType') {
      // When goal type changes, reset target weight change to first option of new type
      setInputs(prev => ({
        ...prev,
        [field]: value,
        targetWeightChange: weightChangeOptions[value][0].value
      }));
    } else {
      setInputs(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateResults = () => {
    if (!validateInputs()) return;
    setWarning(null);

    const {
      age, weight, height, gender, activityLevel,
      goalType, targetWeightChange, goalWeight, bodyFat
    } = inputs;

    // Parse inputs
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    const bf = parseFloat(bodyFat);
    const activity = parseFloat(activityLevel);
    const weeklyChange = parseFloat(targetWeightChange);
    const goalW = parseFloat(goalWeight);

    // BMR Calculation
    let bmr;
    if (bf) {
      const leanMass = w * (1 - bf/100);
      bmr = 370 + (21.6 * leanMass);
    } else {
      bmr = gender === 'male' 
        ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
        : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }

    const maintenance = bmr * activity;
    const requestedCalorieAdjustment = (weeklyChange * 7700) / 7;
    
    let totalCalories = goalType === 'surplus' 
      ? maintenance + requestedCalorieAdjustment 
      : maintenance - requestedCalorieAdjustment;

    // Safety checks
    const minCalories = gender === 'male' ? 1500 : 1200;
    const maxDeficit = maintenance * 0.25;
    let adjustedCalories = false;
    let actualWeeklyChange = weeklyChange;

    if (goalType === 'deficit') {
      const safeDeficit = maintenance - maxDeficit;
      if (totalCalories < safeDeficit) {
        totalCalories = Math.max(safeDeficit, minCalories);
        actualWeeklyChange = ((maintenance - totalCalories) * 7) / 7700;
        adjustedCalories = true;
      }
    }

    if (totalCalories < minCalories) {
      totalCalories = minCalories;
      actualWeeklyChange = ((maintenance - minCalories) * 7) / 7700;
      adjustedCalories = true;
    }

    // Macro calculations
    const protein = w * 2.2;
    const fatPercentage = 0.25;
    const fatCalories = totalCalories * fatPercentage;
    const fat = fatCalories / 9;
    const carbCalories = totalCalories - (protein * 4 + fatCalories);
    const carbs = Math.max(0, carbCalories / 4);

    // Goal validation
    const weightDifference = Math.abs(goalW - w);
    const isWeightLossGoal = goalW < w;
    const weeksToGoal = weightDifference / actualWeeklyChange;

    if ((isWeightLossGoal && goalType === 'surplus') || 
        (!isWeightLossGoal && goalType === 'deficit')) {
      setWarning(`Goal conflict: You selected ${goalType === 'surplus' ? 'weight gain' : 'weight loss'} but your goal weight suggests ${isWeightLossGoal ? 'weight loss' : 'weight gain'}.`);
    }

    if (adjustedCalories) {
      setWarning(`Your target calories have been adjusted to maintain a safe ${goalType === 'surplus' ? 'surplus' : 'deficit'}. Actual weekly change will be ${actualWeeklyChange.toFixed(2)} kg.`);
    }

    setResults({
      maintenance: maintenance.toFixed(0),
      totalCalories: totalCalories.toFixed(0),
      protein: protein.toFixed(0),
      fat: fat.toFixed(0),
      carbs: carbs.toFixed(0),
      weeksToGoal: weeksToGoal.toFixed(1),
      actualWeeklyChange: actualWeeklyChange.toFixed(2),
      adjustedCalories,
      originalTarget: weeklyChange
    });
  };

  return (
    <div className={`max-w-4xl mx-auto ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-[#212529]'} p-6 rounded-lg shadow-lg mb-8`}>
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'} text-center mb-4`}>Calorie Calculator</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Age</label>
          <input type="number" value={inputs.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`} />
        </div>

        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Weight (kg)</label>
          <input type="number" value={inputs.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`} />
        </div>

        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Height (cm)</label>
          <input type="number" value={inputs.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`} />
        </div>

        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Body Fat (%)</label>
          <input type="number" value={inputs.bodyFat}
            onChange={(e) => handleInputChange('bodyFat', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`}
            placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Gender</label>
          <select value={inputs.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Activity Level</label>
          <select value={inputs.activityLevel}
            onChange={(e) => handleInputChange('activityLevel', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`}>
            {activityLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Goal</label>
          <select value={inputs.goalType}
            onChange={(e) => handleInputChange('goalType', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`}>
            <option value="surplus">Weight Gain</option>
            <option value="deficit">Weight Loss</option>
          </select>
        </div>

        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Target {inputs.goalType === 'surplus' ? 'Gain' : 'Loss'} per Week
          </label>
          <select value={inputs.targetWeightChange}
            onChange={(e) => handleInputChange('targetWeightChange', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`}>
            {weightChangeOptions[inputs.goalType].map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Goal Weight (kg)</label>
          <input type="number" value={inputs.goalWeight}
            onChange={(e) => handleInputChange('goalWeight', e.target.value)}
            className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded`} />
        </div>
      </div>

      <button onClick={calculateResults}
        className={`w-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#007BFF] hover:bg-[#0056b3]'} text-white py-2 rounded mt-6 font-semibold transition-colors duration-200`}>
        Calculate
      </button>

      {warning && (
        <div className={`mt-4 p-3 ${darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-200 text-yellow-800'} rounded`}>
          <strong>Note:</strong> {warning}
        </div>
      )}

      {results && (
        <div className={`mt-6 space-y-3 ${darkMode ? 'text-[#E0E0E0]' : 'text-[#212529]'}`}>
          <div className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>Results</div>
          <div>Maintenance Calories: <span className="float-right">{results.maintenance} kcal</span></div>
          <div>Target Calories: <span className="float-right">{results.totalCalories} kcal</span></div>
          <div>Daily {inputs.goalType === 'surplus' ? 'Surplus' : 'Deficit'}: 
            <span className="float-right">{Math.abs(results.totalCalories - results.maintenance)} kcal</span></div>
          
          {results.adjustedCalories && (
            <div className={`${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-100'} p-2 rounded mt-2`}>
              <div className={`${darkMode ? 'text-blue-400' : 'text-[#007BFF]'}`}>Adjusted Rate:</div>
              <div>Target: {results.originalTarget} kg/week</div>
              <div>Actual: {results.actualWeeklyChange} kg/week</div>
            </div>
          )}
          
          <div className={`pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            Protein (2.2g/kg): <span className="float-right">{results.protein}g</span>
          </div>
          <div>Fats (25%): <span className="float-right">{results.fat}g</span></div>
          <div>Carbs: <span className="float-right">{results.carbs}g</span></div>
          <div className={`pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            Time to Reach Goal: <span className="float-right">{results.weeksToGoal} weeks</span>
          </div>
        </div>
      )}
    </div>
  );
}