import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [userRecipes, setUserRecipes] = useState([]); // Add state for user recipes
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndRecipes = async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            name: userData.name,
            bio: userData.bio || '',
            location: userData.location || '',
            website: userData.website || ''
          });

          // Fetch user's recipes
          const recipesResponse = await fetch('/api/users/recipes', { 
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
      const response = await fetch('/api/profile/update', {
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

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="w-full md:w-1/3">
                <label className="block mb-4">
                  <span className="text-gray-700">Profile Picture</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full p-2 border rounded-md h-32"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full p-2 border rounded-md"
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
              <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              
              {user.bio && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">About Me</h3>
                  <p className="text-gray-700 whitespace-pre-line">{user.bio}</p>
                </div>
              )}
              
              {user.role === 'admin' && (
                <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800">
                    ⚙️ Administrator Account
                  </h3>
                  <p className="text-yellow-700 mt-2">
                    You have full administrative privileges
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {user.location && (
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Submitted Recipes
          </h2>
          
          {userRecipes.length === 0 ? (
            <p className="text-gray-600">No recipes submitted yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRecipes.map(recipe => (
                <div 
                  key={recipe.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
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
                    <h3 className="font-semibold text-lg mb-2">{recipe.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(recipe.created_at).toLocaleDateString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        recipe.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {recipe.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Submitted by: {recipe.username}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}