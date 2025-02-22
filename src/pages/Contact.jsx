import React from 'react';
import ContactForm from "../components/contact/ContactForm.jsx"; 

export default function Contact() {
  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl border-4 border-gray-700">
          <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-6">Contact Us</h1>
          <p className="text-gray-300 text-center mb-8">
            Welcome to Bulk Buddy. If you have any questions or comments, feel free to reach out to us!
          </p>

          {/* ContactForm */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}