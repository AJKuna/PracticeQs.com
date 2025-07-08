import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

const FeedbackWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't render the widget if user is not signed in
  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setAlert({ type: 'error', message: 'Please enter your feedback.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.email?.split('@')[0] || 'User', // Use first part of email as name
          email: user.email || 'unknown@practiceqs.com',
          message: `[FEEDBACK WIDGET] ${message}` // Tag it as feedback from widget
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Thank you for your feedback!' });
        setMessage('');
        // Auto-close after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
          setAlert(null);
        }, 2000);
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to send feedback. Please try again.' });
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      setAlert({ type: 'error', message: 'Failed to send feedback. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setAlert(null);
  };

  return (
    <>
      {/* CSS for animation */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          @keyframes slideOut {
            from {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
            to {
              opacity: 0;
              transform: scale(0.9) translateY(-10px);
            }
          }
        `}
      </style>

      {/* Feedback Tab - Fixed on right side */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-6 rounded-l-lg shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ writingMode: 'vertical-lr' }}
        >
          <div className="flex items-center space-y-2">
            <svg className="w-4 h-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">Feedback?</span>
          </div>
        </button>
      </div>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-w-sm transform transition-all duration-300 ease-out"
            style={{ animation: isOpen ? 'slideIn 0.3s ease-out' : 'slideOut 0.3s ease-in' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  How could we improve Practice Qs for you?
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {alert && (
                <div className={`mb-4 p-3 rounded-md ${
                  alert.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  <div className="text-sm">{alert.message}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Please type here..."
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget; 