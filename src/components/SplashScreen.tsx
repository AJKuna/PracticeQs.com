import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SplashScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateLastSplashShown } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Update the last splash shown date when splash screen opens
      updateLastSplashShown().catch(error => {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to update last splash shown:', error);
        }
      });
    }
  }, [isOpen, updateLastSplashShown]);

  useEffect(() => {
    if (profile && user) {
      // Determine if user is new or returning
      const profileCreatedAt = new Date(profile.created_at);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - profileCreatedAt.getTime()) / (1000 * 60 * 60);
      
      // Consider user "new" if profile was created within the last 24 hours
      // and they don't have a last_sign_in or it's very recent to creation
      const isNewUser = hoursSinceCreation < 24 && (
        !profile.last_sign_in || 
        (new Date(profile.last_sign_in).getTime() - profileCreatedAt.getTime()) < (1000 * 60 * 5) // 5 minutes
      );
      
      setIsReturningUser(!isNewUser);
    }
  }, [profile, user]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the fade-out animation duration
  };

  const handleSubjectClick = (subject: string) => {
    // Convert subject to URL-friendly format (lowercase with hyphens)
    const urlSubject = subject.toLowerCase().replace(/ /g, '-');
    handleClose(); // Close splash screen first
    setTimeout(() => {
      navigate(`/generator/${urlSubject}`);
    }, 300); // Wait for splash screen to close
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-all duration-300 ease-in-out z-50 ${
        isVisible ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-0'
      }`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 ease-in-out ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header with close button */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Welcome emoji */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">👋</div>
            </div>
            
            {/* Welcome message */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isReturningUser ? 'Welcome back to Practice Qs' : 'Welcome to Practice Qs'}
              </h1>
              <p className="text-gray-600 mb-6">
                {isReturningUser 
                  ? 'Let’s boost those grades!' 
                  : 'Your journey to academic excellence starts here'
                }
              </p>
            </div>
          </div>

          {/* Updates section */}
          <div className="px-6 pb-6">
            {/* Latest Updates Header */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Updates</h2>
            
            {/* Introducing Streaks Card */}
            <div 
              className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 cursor-pointer transition-all duration-200 hover:bg-orange-100 hover:border-orange-300 hover:shadow-md transform hover:-translate-y-0.5"
              onClick={handleClose}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl" style={{ animation: 'pulse 2s infinite' }}>🧠</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-700 mb-1">
                    Introducing Streaks
                  </h3>
                  <p className="text-gray-700 text-sm">Stay committed to learning and boost your streak!</p>
                </div>
              </div>
            </div>

            {/* GCSE History AQA Card */}
            <div 
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 cursor-pointer transition-all duration-200 hover:bg-green-100 hover:border-green-300 hover:shadow-md transform hover:-translate-y-0.5"
              onClick={() => handleSubjectClick('history')}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">📚</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">GCSE History AQA</h3>
                  <p className="text-gray-700 text-sm">Full update with comprehensive content</p>
                </div>
              </div>
            </div>

            {/* GCSE Geography AQA Card */}
            <div 
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 cursor-pointer transition-all duration-200 hover:bg-green-100 hover:border-green-300 hover:shadow-md transform hover:-translate-y-0.5"
              onClick={() => handleSubjectClick('geography')}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌍</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">GCSE Geography AQA</h3>
                  <p className="text-gray-700 text-sm">Full update with comprehensive content</p>
                </div>
              </div>
            </div>

            {/* GCSE Biology AQA + Edexcel Card */}
            <div 
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 cursor-pointer transition-all duration-200 hover:bg-green-100 hover:border-green-300 hover:shadow-md transform hover:-translate-y-0.5"
              onClick={() => handleSubjectClick('biology')}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🧬</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">GCSE Biology AQA + Edexcel</h3>
                  <p className="text-gray-700 text-sm">Full update with comprehensive content</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section with subtle call to action - only for new users */}
          {!isReturningUser && (
            <div className="px-6 pb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Ready to boost your grades? Let's get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 