import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

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
      
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            Terms and Conditions
          </h1>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium">Home</span>
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-8 space-y-6" style={{backgroundColor: 'white'}}>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By using this site, you agree to comply with these Terms of Use. If you are under 18, you should use this service under the supervision of a parent, guardian, teacher, or tutor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Educational Purpose</h2>
            <p className="text-gray-700">
              This practice question generator is intended for educational use only. While we strive for accuracy, we recommend cross-referencing with official curriculum materials and exam board specifications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Responsibility</h2>
            <p className="text-gray-700">
              Users must not attempt to reverse engineer, abuse, or automate the use of the site beyond the limits provided (e.g., 30 questions per day for free users). Misuse may result in account restriction or removal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Intellectual Property</h2>
            <p className="text-gray-700">
              All generated content remains the intellectual property of the website. You may use it for personal, non-commercial educational purposes. Redistribution, resale, or commercial use requires prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
            <p className="text-gray-700">
              We provide this platform "as is." We do not guarantee the accuracy, completeness, or suitability of generated content for exam preparation. Use of this content is at your own discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update these Terms at any time. Continued use of the site indicates your acceptance of any changes.
            </p>
          </section>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-500">
              Last updated: June 10, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 