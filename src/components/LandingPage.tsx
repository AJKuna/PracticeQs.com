import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PricingModal from './PricingModal';
import FeedbackWidget from './FeedbackWidget';
import { API_CONFIG } from '../config/api';

interface SubjectCard {
  title: string;
  icon: string;
  color: string;
  disabled?: boolean;
}

const subjects: SubjectCard[] = [
  { title: 'Mathematics', icon: '📐', color: 'bg-blue-100 hover:bg-blue-200' },
  { title: 'Physics', icon: '⚡', color: 'bg-purple-100 hover:bg-purple-200' },
  { title: 'Chemistry', icon: '🧪', color: 'bg-green-100 hover:bg-green-200' },
  { title: 'Biology', icon: '🧬', color: 'bg-red-100 hover:bg-red-200' },
  { title: 'History', icon: '🏛️', color: 'bg-orange-100 hover:bg-orange-200' },
  { title: 'Geography', icon: '🌍', color: 'bg-teal-100 hover:bg-teal-200' },
  { title: 'Religious Studies', icon: '🕊️', color: 'bg-indigo-100 hover:bg-indigo-200' },
  { title: 'Computer Science', icon: '💻', color: 'bg-cyan-100 hover:bg-cyan-200' },
  { title: 'English', icon: '📚', color: 'bg-yellow-100 hover:bg-yellow-200', disabled: true }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);

  const handleSubjectClick = (subject: string, disabled?: boolean) => {
    if (disabled) return; // Prevent navigation for disabled subjects
    
    // Convert spaces to hyphens and make lowercase for URL-friendly format
    const urlSubject = subject.toLowerCase().replace(/ /g, '-');
    navigate(`/generator/${urlSubject}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.CREATE_PORTAL_SESSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          returnUrl: window.location.origin + '/home'
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json();
        console.error('Portal session error:', errorData);
        alert(`Failed to create portal session: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Network error creating portal session');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo in top left corner - responsive sizing */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer hover:opacity-75 transition-opacity focus:outline-none border-none focus:ring-0 focus:border-none"
        >
          <img 
            src="/logo.svg" 
            alt="Logo" 
            className="h-12 w-auto sm:h-16 lg:h-24"
          />
        </button>
      </div>

      {/* Top right buttons - only show if user is logged in */}
      {user && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex gap-1 sm:gap-2">
          {/* Upgrade button - only show for non-premium users */}
          {profile && profile.subscription_tier === 'free' && (
            <button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Upgrade</span>
            </button>
          )}

          {/* Manage Subscription button - only show for premium users */}
          {profile && profile.subscription_tier === 'premium' && (
            <button
              onClick={handleManageSubscription}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Manage Subscription</span>
              <span className="text-xs sm:text-sm font-medium sm:hidden">Manage</span>
            </button>
          )}
          
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-red-600 text-white hover:bg-red-700 border border-red-600 rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">Sign Out</span>
          </button>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto pt-24 sm:pt-32 lg:pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <button
              key={subject.title}
              onClick={() => handleSubjectClick(subject.title, subject.disabled)}
              disabled={subject.disabled}
              className={`${
                subject.disabled 
                  ? 'bg-gray-100 cursor-not-allowed opacity-75' 
                  : subject.color
              } p-10 rounded-lg shadow-sm transition-all duration-200 ${
                subject.disabled 
                  ? '' 
                  : 'transform hover:scale-105'
              } text-center relative`}
            >
              <div className="text-4xl mb-4">{subject.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900">
                {subject.title}
              </h2>
              {subject.disabled && (
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  Coming Soon
                </div>
              )}
            </button>
          ))}
        </div>

{/* Minimal Footer */}
<div className="mt-16 pt-8 border-t border-gray-200">
  <div className="flex justify-between items-center">
    {/* Copyright notice on the left */}
    <div className="text-sm text-gray-500">
      © Practice Qs
    </div>
    
    {/* Existing buttons on the right */}
    <div className="flex space-x-6 text-sm text-gray-500">
      <button
        onClick={() => navigate('/privacy')}
        className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        Privacy Policy
      </button>
      <button
        onClick={() => navigate('/cookies')}
        className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        Cookie Policy
      </button>
      <button
        onClick={() => navigate('/terms')}
        className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        Terms & Conditions
      </button>
      <button
        onClick={() => navigate('/contact')}
        className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        Contact
      </button>
    </div>
  </div>
  
  {/* Safeguarding Notice */}
  <div className="mt-4 text-center">
    <p className="text-xs text-gray-500">
      We're committed to safeguarding and promoting the welfare of children. This site is designed for use by adults or with adult supervision.
    </p>
  </div>
</div>

      </div>

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
};

export default LandingPage; 