import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

interface StickyFeedbackBarProps {
  show: boolean;
}

const StickyFeedbackBar: React.FC<StickyFeedbackBarProps> = ({ show }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customText, setCustomText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    if (show && user) {
      const feedbackDismissed = localStorage.getItem(`feedback-dismissed-${user.id}`);
      if (!feedbackDismissed) {
        setIsExpanded(true);
      }
    }
  }, [show, user]);

  // Don't render if user is not signed in or not showing
  if (!user || !show || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`feedback-dismissed-${user.id}`, 'true');
    }
    setIsDismissed(true);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      setAlert({ type: 'error', message: 'Please select a feedback option.' });
      return;
    }

    if ((selectedOption === 'exam-levels' || selectedOption === 'other') && !customText.trim()) {
      setAlert({ type: 'error', message: 'Please provide additional details.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let feedbackMessage = '';
      switch (selectedOption) {
        case 'topic-progress':
          feedbackMessage = '[STICKY FEEDBACK] Topic progress tracking';
          break;
        case 'save-questions':
          feedbackMessage = '[STICKY FEEDBACK] Save questions menu';
          break;
        case 'exam-levels':
          feedbackMessage = `[STICKY FEEDBACK] Questions for more exam levels, subjects and exam boards - ${customText}`;
          break;
        case 'other':
          feedbackMessage = `[STICKY FEEDBACK] Other - ${customText}`;
          break;
      }

      const response = await fetch(API_CONFIG.ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.email?.split('@')[0] || 'User',
          email: user.email || 'unknown@practiceqs.com',
          message: feedbackMessage
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Thank you for your feedback! We\'ll use this to improve PracticeQs.' });
        setTimeout(() => {
          handleDismiss();
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

  return (
    <>
      {/* Collapsed state - small pill in bottom corner */}
      {!isExpanded && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <span className="text-lg">💡</span>
            <span className="text-sm font-medium">Feedback</span>
          </button>
        </div>
      )}

      {/* Expanded state - positioned below content */}
      {isExpanded && (
        <div className="bg-white border-t border-gray-200 shadow-lg mt-8">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  What would you like us to add next to PracticeQs?
                </h3>
                <p className="text-sm text-gray-600">
                  Help us improve by sharing what features matter most to you.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Dismiss feedback"
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

            <div className="space-y-3">
              {/* Topic progress tracking */}
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedOption === 'topic-progress' 
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                  : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="feedback"
                  value="topic-progress"
                  checked={selectedOption === 'topic-progress'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <span className="text-gray-900 font-medium">Topic progress tracking</span>
                </div>
              </label>

              {/* Save questions menu */}
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedOption === 'save-questions' 
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                  : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="feedback"
                  value="save-questions"
                  checked={selectedOption === 'save-questions'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💾</span>
                  <span className="text-gray-900 font-medium">Save questions menu</span>
                </div>
              </label>

              {/* More exam levels */}
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedOption === 'exam-levels' 
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                  : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="feedback"
                  value="exam-levels"
                  checked={selectedOption === 'exam-levels'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📚</span>
                    <span className="text-gray-900 font-medium">Questions for more exam levels, subjects and exam boards</span>
                  </div>
                  {selectedOption === 'exam-levels' && (
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Please specify which subjects, exam boards, or levels you'd like to see..."
                      className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  )}
                </div>
              </label>

              {/* Other */}
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedOption === 'other' 
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                  : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="feedback"
                  value="other"
                  checked={selectedOption === 'other'}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💭</span>
                    <span className="text-gray-900 font-medium">Other</span>
                  </div>
                  {selectedOption === 'other' && (
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Tell us what you'd like to see..."
                      className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  )}
                </div>
              </label>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedOption}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StickyFeedbackBar;
