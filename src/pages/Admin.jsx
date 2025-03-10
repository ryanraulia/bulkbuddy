import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const AdminPage = () => {
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingRecipes = async () => {
      try {
        const response = await axios.get('/api/admin/pending-recipes', {
          withCredentials: true
        });
        setPendingRecipes(response.data);
      } catch (err) {
        setError('Failed to fetch pending recipes');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchPendingRecipes();
    }
  }, [user]);

  const handleApprove = async (recipeId) => {
    try {
      await axios.put(`/api/admin/approve-recipe/${recipeId}`, {}, {
        withCredentials: true
      });
      setPendingRecipes(pendingRecipes.filter(recipe => recipe.id !== recipeId));
    } catch (err) {
      setError('Failed to approve recipe');
    }
  };

  const handleReject = async (recipeId) => {
    try {
      await axios.delete(`/api/admin/reject-recipe/${recipeId}`, {
        withCredentials: true
      });
      setPendingRecipes(pendingRecipes.filter(recipe => recipe.id !== recipeId));
    } catch (err) {
      setError('Failed to reject recipe');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className={`min-h-screen py-8 ${darkMode ? 'bg-gradient-to-b from-[#121212] via-[#181818] to-[#121212]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'} text-${darkMode ? '[#E0E0E0]' : '[#212529]'} text-center`}>
        <h1 className="text-2xl text-red-500">Admin access required</h1>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 ${darkMode ? 'bg-gradient-to-b from-[#121212] via-[#181818] to-[#121212]' : 'bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100'} text-${darkMode ? '[#E0E0E0]' : '[#212529]'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-8">
          Pending Recipe Approvals
        </h1>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          </div>
        )}

        {error && (
          <div className="text-red-500 p-4 mb-4 bg-red-100 rounded">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRecipes.map((recipe) => (
            <div key={recipe.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
              <h3 className="text-xl font-bold mb-3 text-yellow-400">{recipe.title}</h3>
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-2">
                <p><strong>Calories:</strong> {recipe.calories}</p>
                <p><strong>Protein:</strong> {recipe.protein}g</p>
                <p><strong>Carbs:</strong> {recipe.carbs}g</p>
                <p><strong>Fat:</strong> {recipe.fat}g</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(recipe.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(recipe.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && pendingRecipes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No pending recipes for approval
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;