import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { darkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('Your message has been sent successfully!');
        // Reset form fields
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className={`block text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Name</label>
        <input 
          type="text" 
          id="name" 
          className={`w-full p-4 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded-lg focus:ring-2 focus:ring-blue-500`}
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="email" className={`block text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Email</label>
        <input 
          type="email" 
          id="email" 
          className={`w-full p-4 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded-lg focus:ring-2 focus:ring-blue-500`}
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="message" className={`block text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Message</label>
        <textarea 
          id="message" 
          className={`w-full p-4 border ${darkMode ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0]' : 'border-gray-300 bg-white text-[#212529]'} rounded-lg focus:ring-2 focus:ring-blue-500`}
          rows="5" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          required 
          disabled={isSubmitting}
        />
      </div>

      {status && (
        <p className={`text-center ${status.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
          {status}
        </p>
      )}

      <button 
        type="submit" 
        className={`w-full p-4 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#007BFF] hover:bg-[#0056b3]'} text-white rounded-lg transition-colors duration-200 disabled:opacity-50`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}