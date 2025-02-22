import React from 'react';

export default function LoginForm() {
  return (
    <form>
      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
        <input type="email" className="w-full px-3 py-2 border rounded-lg text-black bg-gray-800" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Password</label>
        <input type="password" className="w-full px-3 py-2 border rounded-lg text-black bg-gray-800" />
      </div>
      <button type="submit" className="w-full bg-yellow-500 text-black py-2 rounded-lg">
        Login
      </button>
    </form>
  );
}