import React, { useEffect, useState } from 'react';

interface StreakPopupProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
}

const StreakPopup: React.FC<StreakPopupProps> = ({ isOpen, onClose, streakCount }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200); // Wait for animation to complete
  };

  const getPopupMessage = () => {
    if (streakCount === 1) {
      return "Great start! Day 1 Complete!";
    } else {
      return `Amazing! ${streakCount} Day Streak!`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', // Green gradient background
        }}
      >
        {/* Green header with brain icon */}
        <div className="text-center pt-8 pb-4">
          <div className="mb-4">
            {/* Large brain icon with green glow effect */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-200 rounded-full shadow-lg">
              <span 
                className="text-4xl"
                role="img" 
                aria-label="brain"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))',
                }}
              >
                🧠
              </span>
            </div>
          </div>
          
          {/* Main message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getPopupMessage()}
          </h2>
          
          {/* Celebration emoji */}
          <div className="text-3xl mb-4" role="img" aria-label="celebration">
            🎉
          </div>
          
          {/* Subtext */}
          <p className="text-gray-700 text-base px-6 leading-relaxed">
            You've practiced today! Keep the learning momentum going strong.
          </p>
        </div>

        {/* Action button */}
        <div className="px-6 pb-8">
          <button
            onClick={handleClose}
            className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            I'm committed to learning
          </button>
        </div>

        {/* Optional: Close button in top right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
          {/* Subtle sparkle effects */}
          <div className="absolute top-8 left-8 w-2 h-2 bg-green-300 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-16 right-12 w-1 h-1 bg-green-400 rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-12 w-1.5 h-1.5 bg-green-300 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 right-8 w-1 h-1 bg-green-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default StreakPopup;
