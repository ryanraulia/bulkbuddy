// src/pages/Home/Home.jsx
import React from 'react';
import Layout from "../components/layout/Layout.jsx";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold mb-4 text-center">Welcome to BulkBuddy</h1>
        <p className="text-gray-600 text-center">Your personalized meal planning solution</p>
      </div>
    </Layout>
  );
}
