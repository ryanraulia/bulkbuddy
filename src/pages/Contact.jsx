// src/pages/Home/Home.jsx
import React from 'react';
import Layout from "../components/layout/Layout.jsx";

export default function Contact() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="border-4 border-gray-300 rounded-lg p-8 text-center max-w-xl w-full">
          <h1 className="text-3xl font-bold mb-4 max-w-xl mx-auto">Contact</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Welcome to Bulk Buddy. Contact time
          </p>
        </div>
      </div>
    </Layout>
  );
}
