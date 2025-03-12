import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaAppleAlt, FaCheck } from 'react-icons/fa';

export default function Home() {
  const [targetCalories, setTargetCalories] = useState('');
  const [diet, setDiet] = useState('');
  const [exclude, setExclude] = useState(''); // Add state for exclusions
  const [timeFrame, setTimeFrame] = useState('day'); // Add state for time frame
  const navigate = useNavigate();

  const dietaryOptions = [
    { value: "", label: "Select Dietary Preference (Optional)" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten free", label: "Gluten Free" },
    { value: "ketogenic", label: "Ketogenic" },
    { value: "paleo", label: "Paleo" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Process exclusions
      const excludeIngredients = exclude.split(',')
        .map(item => item.trim())
        .filter(item => item !== '')
        .join(',');

      const queryParams = new URLSearchParams({
        targetCalories: targetCalories,
        timeFrame: timeFrame,  // Add timeFrame to params
      });
      
      if (diet) queryParams.append('diet', diet);
      if (excludeIngredients) queryParams.append('exclude', excludeIngredients);

      // Modify your fetch call to include credentials and headers
      const response = await fetch(`http://localhost:5000/api/mealplan?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include', // Important for cookies/auth
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate meal plan');
      }
      const data = await response.json();
      navigate('/mealplan', { state: data });
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      alert(error.message); // Show error message to user
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] text-[#212529] py-16 px-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          <span className="text-[#007BFF]">Power</span> Your <span className="text-[#007BFF]">Fitness</span> Journey
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Personalized meal plans designed to help you reach your fitness goals with precision nutrition
        </p>
      </section>

      {/* Main Card */}
      <section className="w-full max-w-2xl mx-auto" aria-labelledby="meal-plan-heading">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#007BFF] to-[#0056b3] p-6 flex items-center justify-between">
            <h2 id="meal-plan-heading" className="text-2xl font-bold text-white flex items-center">
              <FaUtensils className="mr-3" aria-hidden="true" />
              Meal Plan Generator
            </h2>
            <div className="bg-[#0056b3] text-white text-sm font-medium py-1 px-3 rounded-full">
              Free
            </div>
          </div>
          
          {/* Card Content */}
          <div className="p-6">
            <p className="mb-6 text-gray-700">
              Create your personalized meal plan by entering your daily calorie target, dietary preferences, and any ingredients to exclude below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Calorie Input */}
              <div>
                <label htmlFor="calorie-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Calorie Target <span className="text-[#007BFF]">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="calorie-input"
                    type="number"
                    placeholder="Enter target calories (e.g., 2500)"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    className="w-full p-3 bg-white text-[#212529] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] transition"
                    required
                    aria-required="true"
                    min="1000"
                    max="10000"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400">kcal</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-400">Recommended for bulking: current maintenance + 300-500 calories</p>
              </div>

              {/* Plan Duration Dropdown */}
              <div>
                <label htmlFor="time-frame" className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Duration <span className="text-[#007BFF]">*</span>
                </label>
                <select
                  id="time-frame"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                  className="w-full p-3 bg-white text-[#212529] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] transition"
                  required
                >
                  <option value="day">Single Day</option>
                  <option value="week">Full Week</option>
                </select>
              </div>

              {/* Dietary Preferences Dropdown */}
              <div>
                <label htmlFor="diet-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preference (Optional)
                </label>
                <select
                  id="diet-select"
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full p-3 bg-white text-[#212529] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] transition"
                  aria-label="Select your dietary preference"
                >
                  {dietaryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exclude Ingredients Input */}
              <div>
                <label htmlFor="exclude-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Exclude Ingredients (comma-separated)
                </label>
                <input
                  id="exclude-input"
                  type="text"
                  placeholder="e.g., nuts, dairy, gluten"
                  value={exclude}
                  onChange={(e) => setExclude(e.target.value)}
                  className="w-full p-3 bg-white text-[#212529] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] transition"
                />
                <p className="mt-2 text-sm text-gray-400">Enter ingredients you want to avoid</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-[#007BFF] hover:bg-[#0056b3] text-white font-medium p-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:ring-offset-2 focus:ring-offset-white shadow-md"
                aria-label="Generate your meal plan"
              >
                <FaCheck className="mr-2" aria-hidden="true" />
                Generate Meal Plan
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mt-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8 text-[#007BFF]">Why Choose BulkBuddy?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Personalized Plans",
              description: "Tailored meal plans based on your specific calorie needs and dietary preferences.",
              icon: "🎯"
            },
            {
              title: "Nutrition Focused",
              description: "Each meal plan is designed to provide optimal macronutrient balance for muscle growth.",
              icon: "💪"
            },
            {
              title: "Easy to Follow",
              description: "Simple recipes with detailed instructions to make meal prep straightforward.",
              icon: "🍽️"
            }
          ].map((benefit, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#007BFF] transition-colors duration-300">
              <div className="text-3xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-700">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}