import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          navigate('/'); // Redirect if not logged in
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-900">Welcome, {user.name}!</h1>
      <p className="text-lg text-gray-600 mt-2">Email: {user.email}</p>
      <button
        onClick={() => navigate('/')}
        className="mt-5 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-all"
      >
        Go Back to Home
      </button>
    </div>
  );
}