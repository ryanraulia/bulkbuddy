import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { darkMode } = useTheme();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched({
      ...touched,
      [id]: true
    });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getFieldError = (fieldId) => {
    if (!touched[fieldId]) return null;
    
    switch (fieldId) {
      case 'name':
        return formData.name.length < 2 ? 'Name is required' : null;
      case 'email':
        return !formData.email ? 'Email is required' : 
               !validateEmail(formData.email) ? 'Please enter a valid email' : null;
      case 'message':
        return formData.message.length < 10 ? 'Message must be at least 10 characters' : null;
      default:
        return null;
    }
  };

  const isFormValid = () => {
    return (
      formData.name.length >= 2 &&
      formData.email.length > 0 &&
      validateEmail(formData.email) &&
      formData.message.length >= 10
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    setStatus('');
    
    try {
      // Simulating a delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        // Reset form fields
        setFormData({
          name: '',
          email: '',
          message: ''
        });
        setTouched({});
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = `w-full p-4 border rounded-lg focus:outline-none focus:ring-2 ${
    darkMode 
      ? 'border-gray-700 bg-[#1E1E1E] text-[#E0E0E0] focus:ring-blue-500' 
      : 'border-gray-300 bg-white text-[#212529] focus:ring-[#007BFF]'
  }`;

  const errorClasses = `mt-1 text-sm text-red-500`;

  if (status === 'success') {
    return (
      <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-[#1E1E1E]' : 'bg-gray-50'}`}>
        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
        <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Message Sent!</h3>
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Thank you for reaching out. We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus('')}
          className={`px-6 py-3 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#007BFF] hover:bg-[#0056b3]'} text-white rounded-lg transition-colors duration-200`}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className={`block text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium mb-1`}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            className={`${inputClasses} ${getFieldError('name') ? 'border-red-500' : ''}`}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your name"
            required
            disabled={isSubmitting}
          />
          {getFieldError('name') && <p className={errorClasses}>{getFieldError('name')}</p>}
        </div>
        
        <div>
          <label htmlFor="email" className={`block text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium mb-1`}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            className={`${inputClasses} ${getFieldError('email') ? 'border-red-500' : ''}`}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your email address"
            required
            disabled={isSubmitting}
          />
          {getFieldError('email') && <p className={errorClasses}>{getFieldError('email')}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="message" className={`block text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium mb-1`}>
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          className={`${inputClasses} ${getFieldError('message') ? 'border-red-500' : ''}`}
          rows="5"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="How can we help you?"
          required
          disabled={isSubmitting}
        />
        {getFieldError('message') && <p className={errorClasses}>{getFieldError('message')}</p>}
      </div>
      
      {status === 'error' && (
        <div className={`flex items-center p-4 rounded-lg ${darkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-50'}`}>
          <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
          <p className="text-red-500">
            Failed to send message. Please try again or contact us directly at support@bulkbuddy.com
          </p>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className={`px-8 py-4 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#007BFF] hover:bg-[#0056b3]'} text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center min-w-40`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </div>
    </form>
  );
}