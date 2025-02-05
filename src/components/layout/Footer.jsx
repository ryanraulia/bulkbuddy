// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} BulkBuddy. All rights reserved.</p>
        <p className="mt-2 text-gray-400">Your personalized meal planning solution</p>
      </div>
    </footer>
  );
}