import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo in top left corner - responsive sizing */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="h-12 w-auto sm:h-16 lg:h-24"
        />
      </div>
      
      <div className="max-w-4xl mx-auto pt-16 sm:pt-20 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">Home</span>
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-8 space-y-6" style={{backgroundColor: 'white'}}>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-700 mb-3">
              We collect information to provide and improve our practice question generator. The types of information we collect include:
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Personal Information (with consent)</h4>
                <ul className="text-gray-700 ml-6 mb-3">
                  <li>• Email address (for account creation and communication)</li>
                  <li>• Full name (for account personalization)</li>
                  <li>• Payment information (processed securely by Stripe)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Usage Information (with consent)</h4>
                <ul className="text-gray-700 ml-6 mb-3">
                  <li>• Topics selected and questions generated</li>
                  <li>• Website interaction patterns (via Google Analytics)</li>
                  <li>• Device and browser information</li>
                  <li>• IP address (anonymized in Google Analytics)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cookies and Tracking</h4>
                <p className="text-gray-700 mb-2">
                  We use cookies and similar technologies as described in our{' '}
                  <button 
                    onClick={() => navigate('/cookies')}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    Cookie Policy
                  </button>. 
                  You can manage your cookie preferences through our consent banner.
                </p>
              </div>
            </div>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Lawful Basis for Processing</h2>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">Consent (Article 6(1)(a))</h4>
                <p className="text-gray-700 text-sm">For Google Analytics tracking, marketing communications, and optional features.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Contract Performance (Article 6(1)(b))</h4>
                <p className="text-gray-700 text-sm">For user account management, service delivery, and payment processing.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Legitimate Interest (Article 6(1)(f))</h4>
                <p className="text-gray-700 text-sm">For website security, fraud prevention, and essential website functionality.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">Account Data</h4>
                <p className="text-gray-700 text-sm">Retained until account deletion is requested or account is inactive for 3+ years.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Analytics Data</h4>
                <p className="text-gray-700 text-sm">Google Analytics data is retained for 26 months (Google's default setting).</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Cookie Preferences</h4>
                <p className="text-gray-700 text-sm">Stored locally until you clear browser data or change preferences.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact Us</h2>
            <p className="text-gray-700">
              For questions or data concerns, please contact us at aj@practiceqs.com or{' '}
              <button 
                onClick={() => navigate('/contact')}
                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
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