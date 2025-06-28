import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setAlert({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Thank you for your message! We\'ll get back to you soon.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setAlert({ type: 'error', message: 'Failed to send message. Please check your connection and try again.' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo in top left corner - responsive sizing */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="h-12 w-auto sm:h-16 lg:h-24"
        />
      </div>
      
      <div className="max-w-2xl mx-auto pt-16 sm:pt-20 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Contact Us
          </h1>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">Home</span>
          </button>
        </div>

        {alert && (
          <div className={`mb-4 p-4 rounded-md ${
            alert.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {alert.message}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-6">
            <p className="text-gray-700">
              Have questions, feedback, or need help with the practice question generator? 
              We'd love to hear from you! Send us a message and we'll get back to you as soon as possible.
            </p>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm mb-2">
                <strong>Beta Feedback:</strong> Since we are in beta, we would love to hear about your experience! 
                Please fill out our <a 
                  href="https://forms.gle/u2S9TTptr5AJaoAx7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  feedback form
                </a> to help us improve the platform.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Tell us about your question, issue, or feedback..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
