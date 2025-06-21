import React from 'react';
import { useNavigate } from 'react-router-dom';

const BetaLanding: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            className="mx-auto h-20 w-auto"
            src="/logo.svg"
            alt="Practice Qs"
          />
        </div>

        {/* Beta Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
          {/* Beta Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
            BETA VERSION
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Welcome to the Beta of Practice Questions!
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Practice Questions is an AI-powered tool designed to help students, teachers, tutors, and parents generate practice questions instantly. We're currently in beta, which means you're getting early access — and your feedback is incredibly valuable as we fine-tune the experience.
          </p>

          {/* Feedback Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Found a bug? Something confusing? Have a feature idea?
            </h2>
            <p className="text-gray-600 mb-4">
              Help us improve by filling out our quick feedback form:
            </p>
            <a
              href="https://forms.gle/T2jUTfgHR1w6xU3p9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              👉 Click here to leave feedback
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <p className="text-sm text-gray-500 mt-3">
              It only takes 1–2 minutes and makes a big difference.
            </p>
          </div>

          {/* Thank You Message */}
          <p className="text-lg text-gray-700 mb-8 italic">
            Thanks so much for helping shape the future of Practice Qs!
            <br />
            <span className="font-medium">— The Practice Qs Team</span>
          </p>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue to Practice Qs.com
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Your early feedback helps us build a better learning experience for everyone.
        </p>
      </div>
    </div>
  );
};

export default BetaLanding; 