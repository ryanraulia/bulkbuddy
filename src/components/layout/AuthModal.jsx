import React, { useState, useEffect } from "react";
import LoginForm from "../forms/LoginForm";
import SignUpForm from "../forms/SignUpForm";

export default function AuthModal({ isOpen, onClose, showLogin }) {
  const [isLogin, setIsLogin] = useState(showLogin);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLogin(showLogin);
  }, [showLogin]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl transition"
        >
          &times;
        </button>

        <h2 className="text-3xl font-semibold text-center text-gray-900">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h2>
        <p className="text-center text-gray-500 mt-2">
          {isLogin ? "Login to continue" : "Sign up to get started"}
        </p>

        {isLogin ? (
          <LoginForm
            formData={formData}
            error={error}
            handleChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        ) : (
          <SignUpForm
            formData={formData}
            error={error}
            handleChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        )}

        <p className="mt-4 text-center text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-600 font-semibold transition"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}