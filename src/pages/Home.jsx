// src/pages/Home/Home.jsx
import React from 'react';
import Layout from "../components/layout/Layout.jsx";

export default function Home() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Welcome to BulkBuddy</h1>
      <p className="text-gray-600">Your personalized meal planning solution</p>
    </Layout>
  );
}