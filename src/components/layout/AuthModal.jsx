// src/components/layout/AuthModal.jsx
import React, { useState } from "react";

export default function AuthModal({ isOpen, onClose, showLogin }) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(showLogin);

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl transition"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-3xl font-semibold text-center text-gray-900">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-500 mt-2">
          {isLogin ? "Login to continue" : "Sign up to get started"}
        </p>

        {/* Form */}
        <form className="mt-6 space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Switch between Login & Signup */}
        <p className="mt-4 text-center text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-yellow-500 hover:text-yellow-600 font-semibold transition"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
