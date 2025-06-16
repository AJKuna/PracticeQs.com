import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PricingModal from './PricingModal';

interface SubjectCard {
  title: string;
  icon: string;
  color: string;
}

const subjects: SubjectCard[] = [
  { title: 'Mathematics', icon: '📐', color: 'bg-blue-100 hover:bg-blue-200' },
  { title: 'Physics', icon: '⚡', color: 'bg-purple-100 hover:bg-purple-200' },
  { title: 'Chemistry', icon: '🧪', color: 'bg-green-100 hover:bg-green-200' },
  { title: 'Biology', icon: '🧬', color: 'bg-red-100 hover:bg-red-200' },
  { title: 'English', icon: '📚', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { title: 'History', icon: '🏛️', color: 'bg-orange-100 hover:bg-orange-200' },
  { title: 'Geography', icon: '🌍', color: 'bg-teal-100 hover:bg-teal-200' },
  { title: 'Religious Studies', icon: '🕊️', color: 'bg-indigo-100 hover:bg-indigo-200' },
  { title: 'Physical Education', icon: '⚽', color: 'bg-emerald-100 hover:bg-emerald-200' },
  { title: 'Computer Science', icon: '💻', color: 'bg-cyan-100 hover:bg-cyan-200' },
  { title: 'French', icon: '🇫🇷', color: 'bg-rose-100 hover:bg-rose-200' },
  { title: 'Spanish', icon: '🇪🇸', color: 'bg-amber-100 hover:bg-amber-200' }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);

  const handleSubjectClick = (subject: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo in top left corner */}
      <div className="absolute top-4 left-4 z-10">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="h-24 w-auto"
        />
      </div>

      {/* Top right buttons - only show if user is logged in */}
      {user && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Upgrade button - only show for non-premium users */}
          {profile && profile.subscription_tier === 'free' && (
            <button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 rounded-lg transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium">Upgrade</span>
            </button>
          )}
          
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 border border-red-600 rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Practice Question Generator
          </h1>
          <p className="text-xl text-gray-600">
            Select a subject to generate custom practice questions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <button
              key={subject.title}
              onClick={() => handleSubjectClick(subject.title)}
              className={`${subject.color} p-8 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 text-center`}
            >
              <div className="text-4xl mb-4">{subject.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900">
                {subject.title}
              </h2>
            </button>
          ))}
        </div>

{/* Minimal Footer */}
<div className="mt-16 pt-8 border-t border-gray-200">
  <div className="flex justify-center space-x-6 text-sm text-gray-500">
    <button
      onClick={() => navigate('/privacy')}
      className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
    >
      Privacy Policy
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

      </div>

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />
    </div>
  );
};

export default LandingPage; 