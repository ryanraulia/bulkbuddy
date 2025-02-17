// src/components/forms/SignUpForm.jsx
import React from 'react';

export default function SignUpForm() {
  return (
    <form>
      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
        <input type="email" className="w-full px-3 py-2 border rounded-lg text-gray-900" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Password</label>
        <input type="password" className="w-full px-3 py-2 border rounded-lg text-gray-900" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Confirm Password</label>
        <input type="password" className="w-full px-3 py-2 border rounded-lg text-gray-900" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">
        Sign Up
      </button>
    </form>
  );
}