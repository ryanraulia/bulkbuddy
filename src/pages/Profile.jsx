import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import RecipeModal from "../components/recipe/RecipeModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRecipes, setUserRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealPlanRecipe, setSelectedMealPlanRecipe] = useState(null);
  const [dailyNutrition, setDailyNutrition] = useState(null);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchUserAndRecipes = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            name: userData.name,
            bio: userData.bio || '',
            location: userData.location || '',
            website: userData.website
              ? userData.website.match(/^https?:\/\//i)
                ? userData.website
                : `https://${userData.website}`
              : ''
          });

          const recipesResponse = await fetch('/api/user/recipes/user-specific', { 
            credentials: 'include' 
          });
          if (recipesResponse.ok) {
            const recipesData = await recipesResponse.json();
            setUserRecipes(recipesData);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    
    fetchUserAndRecipes();
  }, [navigate]);

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const response = await axios.get(`/api/meal-plans?startDate=${selectedDate}&endDate=${selectedDate}`, {
          withCredentials: true
        });
        setMealPlans(response.data);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
      }
    };
    fetchMealPlans();
  }, [selectedDate]);

  useEffect(() => {
    const fetchDailyNutrition = async () => {
      try {
        const response = await axios.get(`/api/meal-plans/nutrition?date=${selectedDate}`, {
          withCredentials: true
        });
        setDailyNutrition(response.data);
      } catch (error) {
        console.error('Error fetching nutrition:', error);
      }
    };
    
    if (mealPlans.length > 0) {
      fetchDailyNutrition();
    } else {
      setDailyNutrition(null);
    }
  }, [mealPlans, selectedDate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Name is required');
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('bio', formData.bio);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('website', formData.website);
    if (profilePicture) {
      formDataToSend.append('profile_picture', profilePicture);
    }

    try {
      const response = await fetch('/api/auth/profile/update', {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error("Update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
await axios.delete(`/api/user/recipes/delete/${recipeId}`, {        withCredentials: true
      });
      setUserRecipes((recipes) => recipes.filter((r) => r.id !== recipeId));
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Failed to delete recipe');
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className={`min-h-screen ${darkMode 
      ? 'bg-gradient-to-b from-[#1A1A1A] via-[#333333] to-[#1A1A1A]' 
      : 'bg-gradient-to-b  from-gray-100 via-gray-50 to-gray-100'}`}
    >
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <div className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-[#2D2D2D] text-[#E0E0E0]' : 'bg-white text-[#212529]'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          
          {isEditing ? (
            <form onSubmit={handleUpdateProfile}>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="w-full md:w-1/3">
                  <label className="block mb-4">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Profile Picture</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} shadow-sm`}
                      accept="image/*"
                    />
                  </label>
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-500">
                    <img
                      src={profilePicture ? URL.createObjectURL(profilePicture) : 
                        (user.profile_picture || '/default-avatar.png')}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full p-2 rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className={`w-full p-2 rounded-md h-32 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className={`w-full p-2 rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className={`w-full p-2 rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="w-full md:w-1/3">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-500 mx-auto">
                  <img
                    src={user.profile_picture || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-2/3 space-y-4">
                <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h1>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{user.email}</p>
                
                {user.bio && (
                  <div className="mt-4">
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>About Me</h3>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.bio}</p>
                  </div>
                )}
                
                {user.role === 'admin' && (
                  <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      ⚙️ Administrator Account
                    </h3>
                    <p className={darkMode ? 'text-yellow-200' : 'text-yellow-700'}>
                      You have full administrative privileges
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {user.location && (
                    <div className="flex items-center">
                      <svg className={`w-6 h-6 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center">
                      <svg className={`w-6 h-6 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline">
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-all"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-all"
            >
              Go Back to Home
            </button>
          </div>

          {/* User Recipes Section */}
          <div className="mt-12">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Submitted Recipes
            </h2>
            
            {userRecipes.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No recipes submitted yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100'}`}
                  >
                    {recipe.image && (
                      <img
                        src={recipe.image.startsWith('/uploads')
                          ? `http://localhost:5000${recipe.image}`
                          : recipe.image}
                        alt={recipe.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className={`font-semibold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {recipe.title}
                      </h3>
                      {/* Add metadata here if needed */}
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meal Plan Section */}
          <div className="mt-12">
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Meal Plan
            </h2>
            
            <div className="mb-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            </div>
            
            {/* Daily Nutrition Summary */}
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Daily Nutrition Summary
              </h3>
              {dailyNutrition ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Calories</span>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {Math.round(dailyNutrition.total_calories)} / {dailyNutrition.recommended_calories}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ 
                          width: `${Math.min(
                            (dailyNutrition.total_calories / dailyNutrition.recommended_calories) * 100, 
                            100
                          )}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Protein */}
                    <div className="space-y-2">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Protein</div>
                      <div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {dailyNutrition.protein.toFixed(1)}g
                      </div>
                    </div>
                    
                    {/* Carbohydrates */}
                    <div className="space-y-2">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Carbohydrates</div>
                      <div className={`text-xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {dailyNutrition.carbs.toFixed(1)}g
                      </div>
                    </div>
                    
                    {/* Fats */}
                    <div className="space-y-2">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fats</div>
                      <div className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {dailyNutrition.fat.toFixed(1)}g
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {mealPlans.length === 0 ? 'No meals planned for this day.' : 'Calculating nutrition...'}
                </p>
              )}
            </div>

            {mealPlans.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No meals planned for this day.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                  <div key={type} className={`rounded-lg shadow-md p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`font-semibold capitalize text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {type}
                      </h3>
                    </div>
                    {mealPlans
                      .filter(plan => plan.meal_type === type)
                      .map(plan => (
                        <div 
                          key={plan.id} 
                          className="mb-3 cursor-pointer transform transition-all hover:scale-105"
                          onClick={() => setSelectedMealPlanRecipe({
                            id: plan.recipe_id,
                            source: plan.source
                          })}
                        >
                          <div className={`rounded-lg p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            {plan.recipe?.image && (
                              <img
                                src={plan.recipe.image.startsWith('http') 
                                  ? plan.recipe.image
                                  : `http://localhost:5000${plan.recipe.image}`}
                                alt={plan.recipe.title}
                                className="w-full h-32 object-cover rounded-lg mb-2"
                              />
                            )}
                            <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {plan.recipe?.title}
                            </p>
                            <div className="mt-2 text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Calories:</span>
                                <span>
                                  {plan.recipe?.calories ? Number(plan.recipe.calories).toFixed(0) : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className={darkMode ? 'text-green-400' : 'text-green-600'}>Protein:</span>
                                <span>
                                  {plan.recipe?.protein ? Number(plan.recipe.protein).toFixed(1) + 'g' : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className={darkMode ? 'text-yellow-400' : 'text-yellow-600'}>Carbs:</span>
                                <span>
                                  {plan.recipe?.carbs ? Number(plan.recipe.carbs).toFixed(1) + 'g' : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className={darkMode ? 'text-red-400' : 'text-red-600'}>Fat:</span>
                                <span>
                                  {plan.recipe?.fat ? Number(plan.recipe.fat).toFixed(1) + 'g' : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {plan.recipe?.source === 'user' 
                                  ? 'Your Recipe' 
                                  : 'Spoonacular'}
                              </span>
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await axios.delete(`/api/meal-plans/${plan.id}`, {
                                      withCredentials: true
                                    });
                                    setMealPlans(prev => prev.filter(p => p.id !== plan.id));
                                  } catch (error) {
                                    console.error('Error deleting meal plan:', error);
                                  }
                                }}
                                className={`text-xs ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recipe Modal */}
          {selectedMealPlanRecipe && (
            <RecipeModal
              recipeId={selectedMealPlanRecipe.id}
              source={selectedMealPlanRecipe.source}
              onClose={() => setSelectedMealPlanRecipe(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}