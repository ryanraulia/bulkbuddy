import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { Search, Plus, X, Info, ChevronDown, ChevronUp } from 'lucide-react';

const FoodCalorieCalculator = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [meal, setMeal] = useState([]);
  const [selectedServings, setSelectedServings] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [expandedFood, setExpandedFood] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const getSuggestions = async (input) => {
      try {
        const response = await axios.get('/api/food/suggestions', { params: { q: input } });
        setSuggestions(response.data.slice(0, 4));
      } catch (err) {
        console.error('Suggestions error:', err);
      }
    };

    const handler = setTimeout(() => {
      if (query.trim()) getSuggestions(query.trim());
      else setSuggestions([]);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const searchFood = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      const response = await axios.get('/api/food', { params: { q: query } });
      const foods = Array.isArray(response.data) ? response.data : [];
      setResults(foods);
      
      const initialServings = foods.reduce((acc, food) => ({
        ...acc,
        [food.fdcId]: 100
      }), {});
      setSelectedServings(initialServings);
      
    } catch (err) {
      setError(`Error fetching food data: ${err.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addToMeal = (food) => {
    const existingIndex = meal.findIndex(item => item.fdcId === food.fdcId);
    
    if (existingIndex >= 0) {
      const newServings = {...selectedServings};
      newServings[food.fdcId] = (newServings[food.fdcId] || 100) + 100;
      setSelectedServings(newServings);
    } else {
      setMeal(prev => [...prev, food]);
    }
  };

  const removeFromMeal = (foodId) => {
    setMeal(prev => prev.filter(item => item.fdcId !== foodId));
  };

  const calculateTotals = (items) => {
    return items.reduce((acc, item) => {
      const serving = selectedServings[item.fdcId] || 100;
      const multiplier = serving / 100;
      
      acc.calories += (item.calories || 0) * multiplier;
      acc.protein += (item.protein || 0) * multiplier;
      acc.carbs += (item.carbs || 0) * multiplier;
      acc.fat += (item.fat || 0) * multiplier;
      acc.sugar += (item.sugar || 0) * multiplier;
      acc.fiber += (item.fiber || 0) * multiplier;
      acc.sodium += (item.sodium || 0) * multiplier;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, sodium: 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchFood();
    setSuggestions([]);
  };

  const calculateMacroPercentage = () => {
    const total = mealTotal.protein * 4 + mealTotal.carbs * 4 + mealTotal.fat * 9;
    if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: ((mealTotal.protein * 4) / total) * 100,
      carbs: ((mealTotal.carbs * 4) / total) * 100,
      fat: ((mealTotal.fat * 9) / total) * 100
    };
  };

  const mealTotal = calculateTotals(meal);
  const macroPercentages = calculateMacroPercentage();

  const getNutrientColor = (nutrient, value) => {
    if (nutrient === 'protein' && value > 20) return 'text-green-500';
    if (nutrient === 'fat' && value > 30) return 'text-yellow-500';
    if (nutrient === 'sugar' && value > 20) return 'text-red-500';
    return darkMode ? 'text-[#E0E0E0]' : 'text-gray-700';
  };

  return (
    <div className={`max-w-4xl mx-auto rounded-lg shadow-lg mb-8 overflow-hidden ${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-6 ${darkMode ? 'bg-[#2D2D2D]' : 'bg-blue-50'}`}>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-[#E0E0E0]' : 'text-blue-600'} text-center`}>
          Food Nutrition Calculator
        </h2>
        <p className={`mt-1 text-center ${darkMode ? 'text-[#E0E0E0] opacity-80' : 'text-gray-600'}`}>
          Search for foods, add them to your meal, and track nutritional values
        </p>
      </div>
      
      {/* Search Form */}
      <div className={`p-6 ${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'} border-b ${darkMode ? 'border-[#3D3D3D]' : 'border-gray-200'}`}>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className={`absolute inset-y-0 left-0 flex items-center pl-3 ${darkMode ? 'text-[#E0E0E0] opacity-70' : 'text-gray-500'}`}>
                <Search size={18} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for food (e.g. Banana)"
                className={`w-full p-3 pl-10 border rounded-lg ${darkMode ? 'border-[#3D3D3D] text-[#E0E0E0] bg-[#2D2D2D] focus:border-blue-500' : 'border-gray-300 text-gray-700 bg-white focus:border-blue-500'} focus:ring-2 focus:ring-blue-200 outline-none transition duration-200`}
                disabled={loading}
              />
              {suggestions.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto ${darkMode ? 'bg-[#3D3D3D] border-[#3D3D3D]' : 'bg-white border-gray-300'}`}>
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setQuery(item.name);
                        setSuggestions([]);
                      }}
                      className={`p-3 cursor-pointer ${darkMode ? 'hover:bg-[#4D4D4D] text-[#E0E0E0] border-b border-[#3D3D3D]' : 'hover:bg-gray-50 text-gray-700 border-b border-gray-100'} last:border-b-0 transition duration-150`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center min-w-24`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className={`p-4 rounded-lg mb-4 flex items-center gap-2 ${darkMode ? 'bg-red-900/50 text-[#E0E0E0]' : 'bg-red-50 text-red-600'}`}>
            <Info size={18} className={darkMode ? 'text-red-300' : 'text-red-500'} />
            {error}
          </div>
        )}
      </div>

      {/* Results Area */}
      <div className="p-6">
        {/* Search Results */}
        {results.length > 0 ? (
          <div className="space-y-4 mb-8">
            {results.map((food) => (
              <div 
                key={food.fdcId} 
                className={`p-4 rounded-lg ${darkMode ? 'bg-[#3D3D3D] border-[#3D3D3D] text-[#E0E0E0]' : 'bg-white border-gray-200'} border shadow-sm`}
              >
                <div className="flex justify-between">
                  <h3 className={`font-semibold ${darkMode ? 'text-[#E0E0E0]' : 'text-gray-800'} mb-1`}>
                    {food.description}
                  </h3>
                  <button
                    onClick={() => expandedFood === food.fdcId ? setExpandedFood(null) : setExpandedFood(food.fdcId)}
                    className={`p-1 rounded-full ${darkMode ? 'text-[#E0E0E0] hover:bg-[#4D4D4D]' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {expandedFood === food.fdcId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
                
                <div className="mb-3 flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? 'text-[#E0E0E0] opacity-80' : 'text-gray-500'}`}>Serving Size:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      min="1"
                      value={selectedServings[food.fdcId] || 100}
                      onChange={(e) => {
                        const value = Math.max(1, parseInt(e.target.value) || 100);
                        setSelectedServings(prev => ({
                          ...prev,
                          [food.fdcId]: value
                        }));
                      }}
                      className={`w-full p-1 rounded-md text-center ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0] border-[#3D3D3D]' : 'bg-white text-gray-700 border-gray-300'} border`}
                    />
                    <span className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-[#E0E0E0] opacity-70' : 'text-gray-500'} text-sm`}>g</span>
                  </div>
                  <button
                    onClick={() => addToMeal(food)}
                    className={`ml-auto px-3 py-1 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white flex items-center gap-1 transition duration-150`}
                  >
                    <Plus size={16} />
                    Add to Meal
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className={`font-medium ${getNutrientColor('calories', food.calories)}`}>
                    {((food.calories || 0) * (selectedServings[food.fdcId] / 100)).toFixed(0)} cal
                  </div>
                  <div className={`font-medium ${getNutrientColor('protein', food.protein)}`}>
                    {((food.protein || 0) * (selectedServings[food.fdcId] / 100)).toFixed(1)}g protein
                  </div>
                  <div className={`font-medium ${getNutrientColor('carbs', food.carbs)}`}>
                    {((food.carbs || 0) * (selectedServings[food.fdcId] / 100)).toFixed(1)}g carbs
                  </div>
                  <div className={`font-medium ${getNutrientColor('fat', food.fat)}`}>
                    {((food.fat || 0) * (selectedServings[food.fdcId] / 100)).toFixed(1)}g fat
                  </div>
                </div>
                
                {expandedFood === food.fdcId && (
                  <div className={`mt-3 pt-3 grid grid-cols-3 gap-2 ${darkMode ? 'border-t border-[#3D3D3D]' : 'border-t border-gray-200'}`}>
                    <div className={`text-sm ${getNutrientColor('sugar', food.sugar)}`}>
                      <span className={darkMode ? 'text-[#E0E0E0] opacity-70' : 'text-gray-500'}>Sugar:</span> {((food.sugar || 0) * (selectedServings[food.fdcId] / 100)).toFixed(1)}g
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-[#E0E0E0]' : 'text-gray-700'}`}>
                      <span className={darkMode ? 'text-[#E0E0E0] opacity-70' : 'text-gray-500'}>Fiber:</span> {((food.fiber || 0) * (selectedServings[food.fdcId] / 100)).toFixed(1)}g
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-[#E0E0E0]' : 'text-gray-700'}`}>
                      <span className={darkMode ? 'text-[#E0E0E0] opacity-70' : 'text-gray-500'}>Sodium:</span> {((food.sodium || 0) * (selectedServings[food.fdcId] / 100)).toFixed(0)}mg
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : !loading && query && (
          <div className={`text-center py-8 ${darkMode ? 'text-[#E0E0E0] opacity-70' : 'text-gray-500'} rounded-lg ${darkMode ? 'bg-[#3D3D3D]' : 'bg-gray-50'}`}>
            <div className="mb-3">
              <Search size={40} className="mx-auto opacity-30" />
            </div>
            <p>No results found. Try a different search term.</p>
          </div>
        )}

        {/* Meal Summary */}
        {meal.length > 0 && (
          <div className={`mt-8 rounded-lg ${darkMode ? 'bg-[#3D3D3D]' : 'bg-blue-50'}`}>
            <div className={`p-4 ${darkMode ? 'bg-[#2D2D2D]' : 'bg-blue-100'} flex justify-between items-center`}>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-[#E0E0E0]' : 'text-blue-700'}`}>
                Your Meal ({meal.length} items)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMealDetails(!showMealDetails)}
                  className={`p-2 rounded ${darkMode ? 'hover:bg-[#4D4D4D]' : 'hover:bg-blue-200'} ${darkMode ? 'text-[#E0E0E0]' : 'text-blue-700'}`}
                >
                  {showMealDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <button
                  onClick={() => setMeal([])}
                  className={`p-2 rounded ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white flex items-center gap-1`}
                >
                  <X size={16} />
                  Clear
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-gray-700'} shadow-sm`}>
                  <div className="text-xs uppercase opacity-60">Calories</div>
                  <div className="text-xl font-bold">{mealTotal.calories.toFixed(0)}</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-gray-700'} shadow-sm`}>
                  <div className="text-xs uppercase opacity-60">Protein</div>
                  <div className="text-xl font-bold">{mealTotal.protein.toFixed(1)}g</div>
                  <div className="text-xs opacity-70">{macroPercentages.protein.toFixed(0)}% of calories</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-gray-700'} shadow-sm`}>
                  <div className="text-xs uppercase opacity-60">Carbs</div>
                  <div className="text-xl font-bold">{mealTotal.carbs.toFixed(1)}g</div>
                  <div className="text-xs opacity-70">{macroPercentages.carbs.toFixed(0)}% of calories</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-gray-700'} shadow-sm`}>
                  <div className="text-xs uppercase opacity-60">Fat</div>
                  <div className="text-xl font-bold">{mealTotal.fat.toFixed(1)}g</div>
                  <div className="text-xs opacity-70">{macroPercentages.fat.toFixed(0)}% of calories</div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D]' : 'bg-white'} shadow-sm mb-4`}>
                <div className="text-xs uppercase mb-2 opacity-60 text-center">Macro Distribution</div>
                <div className="h-6 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{width: `${macroPercentages.protein}%`}}
                  ></div>
                  <div 
                    className="bg-blue-500 h-full" 
                    style={{width: `${macroPercentages.carbs}%`}}
                  ></div>
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{width: `${macroPercentages.fat}%`}}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-500">P</span>
                  <span className="text-blue-500">C</span>
                  <span className="text-yellow-500">F</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-gray-700'} shadow-sm`}>
                  <div className="text-xs uppercase opacity-60">Sugar</div>
                  <div className={`text-lg font-bold ${getNutrientColor('sugar', mealTotal.sugar)}`}>{mealTotal.sugar.toFixed(1)}g</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-gray-700'} shadow-sm`}>
                  <div className="text-xs uppercase opacity-60">Fiber</div>
                  <div className="text-lg font-bold">{mealTotal.fiber.toFixed(1)}g</div>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-gray-700'} shadow-sm`}>
                  <div className="text-xs uppercase opacity-60">Sodium</div>
                  <div className="text-lg font-bold">{mealTotal.sodium.toFixed(0)}mg</div>
                </div>
              </div>
              
              {showMealDetails && (
                <div className="mt-4">
                  <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-[#E0E0E0]' : 'text-gray-600'}`}>Meal Items</div>
                  <div className={`divide-y ${darkMode ? 'divide-[#3D3D3D]' : 'divide-gray-200'}`}>
                    {meal.map((food) => (
                      <div key={food.fdcId} className="py-2 flex justify-between items-center">
                        <div>
                          <div className={darkMode ? 'text-[#E0E0E0]' : 'text-gray-700'}>{food.description}</div>
                          <div className={`text-sm ${darkMode ? 'text-[#E0E0E0] opacity-80' : 'text-gray-500'}`}>
                            {selectedServings[food.fdcId] || 100}g - {((food.calories || 0) * (selectedServings[food.fdcId] / 100)).toFixed(0)} cal
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative w-16">
                            <input
                              type="number"
                              min="1"
                              value={selectedServings[food.fdcId] || 100}
                              onChange={(e) => {
                                const value = Math.max(1, parseInt(e.target.value) || 100);
                                setSelectedServings(prev => ({
                                  ...prev,
                                  [food.fdcId]: value
                                }));
                              }}
                              className={`w-full p-1 rounded-md text-center text-sm ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0] border-[#3D3D3D]' : 'bg-white text-gray-700 border-gray-300'} border`}
                            />
                            <span className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-[#E0E0E0] opacity-70' : 'text-gray-500'} text-xs`}>g</span>
                          </div>
                          <button
                            onClick={() => removeFromMeal(food.fdcId)}
                            className={`p-1 rounded-full ${darkMode ? 'text-[#E0E0E0] hover:bg-[#4D4D4D] hover:text-red-400' : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCalorieCalculator;