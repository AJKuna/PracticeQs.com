import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
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
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-700 mb-3">
              We collect non-personally identifiable information related to how users interact with our practice question generator, such as:
            </p>
            <ul className="text-gray-700 ml-6 mb-3">
              <li>• Topics selected</li>
              <li>• Number and type of questions generated</li>
              <li>• General usage patterns</li>
            </ul>
            <p className="text-gray-700">
              If users create an account or provide an email address, we collect that information solely for account management and communication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Children's Privacy</h2>
            <p className="text-gray-700">
              This service is intended to be used with the oversight of a teacher, tutor, or parent for users under the age of 18. We do not knowingly collect personal data from children under 13 without verifiable parental consent. If you believe we have unintentionally collected such data, please contact us immediately so we can remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">
              We use the collected data to:
            </p>
            <ul className="text-gray-700 ml-6 mb-3">
              <li>• Provide and personalise question generation</li>
              <li>• Improve our educational content and platform</li>
              <li>• Monitor usage for security and abuse prevention</li>
            </ul>
            <p className="text-gray-700">
              We do not sell, rent, or share personal data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
            <p className="text-gray-700">
              We use appropriate technical and organisational safeguards to protect your information from unauthorised access, alteration, or loss.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
            <p className="text-gray-700 mb-3">
              Under the UK General Data Protection Regulation (UK GDPR), you have the right to:
            </p>
            <ul className="text-gray-700 ml-6 mb-3">
              <li>• Request access to or deletion of your data</li>
              <li>• Withdraw consent at any time</li>
              <li>• File a complaint with the ICO (Information Commissioner's Office)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
            <p className="text-gray-700">
              For questions or data concerns, please contact us at aj@practiceqs.com or{' '}
              <button 
                onClick={() => navigate('/contact')}
                className="text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 transition-colors duration-200"
              >
                contact form
              </button>.
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

export default PrivacyPolicy; 