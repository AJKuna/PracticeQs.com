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
            onClick={() => navigate('/')}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Use of Service</h2>
            <p className="text-gray-700">
              This practice question generator is provided for educational purposes. By using our service, you agree to use it responsibly and in accordance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Educational Content</h2>
            <p className="text-gray-700">
              The questions and answers generated are for practice purposes only. While we strive for accuracy, users should verify information with official educational sources and exam boards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Intellectual Property</h2>
            <p className="text-gray-700">
              Generated content may be used for personal educational purposes. Commercial use or redistribution without permission is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-gray-700">
              We provide this service "as is" and cannot guarantee the accuracy of all generated content. Users are responsible for verifying information before use in examinations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.
            </p>
          </section>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 