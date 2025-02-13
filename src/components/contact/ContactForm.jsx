// components/contact/ContactForm.jsx
import React, { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <label htmlFor="name" className="block text-left text-gray-300 font-medium">Name</label>
        <input 
          type="text" 
          id="name" 
          className="w-full p-4 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-yellow-500" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-left text-gray-300 font-medium">Email</label>
        <input 
          type="email" 
          id="email" 
          className="w-full p-4 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-yellow-500" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-left text-gray-300 font-medium">Message</label>
        <textarea 
          id="message" 
          className="w-full p-4 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-yellow-500" 
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
        className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}