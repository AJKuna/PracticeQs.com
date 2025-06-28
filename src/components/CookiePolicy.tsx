import React from 'react';
import { useNavigate } from 'react-router-dom';

const CookiePolicy: React.FC = () => {
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
            Cookie Policy
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

        <div className="bg-white shadow rounded-lg p-8 space-y-8" style={{backgroundColor: 'white'}}>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently, provide information to website owners, 
              and enhance your browsing experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">
              Practice Qs uses cookies for the following purposes:
            </p>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  Necessary Cookies (Always Active)
                </h3>
                <p className="text-gray-700 mb-3">
                  These cookies are essential for the website to function properly and cannot be disabled.
                </p>
                <ul className="text-gray-700 ml-6 space-y-1">
                  <li>• User authentication and session management</li>
                  <li>• Security features and CSRF protection</li>
                  <li>• Remembering your cookie preferences</li>
                  <li>• Basic website functionality</li>
                </ul>
                <div className="mt-3 text-sm text-gray-600">
                  <strong>Legal Basis:</strong> Legitimate interest (GDPR Article 6(1)(f))
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                  Analytics Cookies (Requires Consent)
                </h3>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our website.
                </p>
                <ul className="text-gray-700 ml-6 space-y-1">
                  <li>• <strong>Google Analytics:</strong> Tracks page views, user behavior, and site performance</li>
                  <li>• <strong>_ga:</strong> Distinguishes unique users (expires after 2 years)</li>
                  <li>• <strong>_ga_XXXXXXXXXX:</strong> Contains campaign and user interaction data (expires after 2 years)</li>
                  <li>• <strong>_gid:</strong> Distinguishes unique users (expires after 24 hours)</li>
                </ul>
                <div className="mt-3 text-sm text-gray-600">
                  <strong>Legal Basis:</strong> Consent (GDPR Article 6(1)(a))
                  <br />
                  <strong>Data Controller:</strong> Google LLC
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                  Marketing Cookies (Requires Consent)
                </h3>
                <p className="text-gray-700 mb-3">
                  These cookies are used to track visitors across websites for advertising purposes.
                </p>
                <ul className="text-gray-700 ml-6 space-y-1">
                  <li>• Advertising campaign tracking</li>
                  <li>• Remarketing and personalized ads</li>
                  <li>• Social media integration</li>
                </ul>
                <div className="mt-3 text-sm text-gray-600">
                  <strong>Legal Basis:</strong> Consent (GDPR Article 6(1)(a))
                  <br />
                  <strong>Note:</strong> Currently not in use, but may be implemented in the future.
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">On Our Website</h4>
                <p className="text-blue-800 text-sm">
                  You can manage your cookie preferences using the cookie consent banner that appears when you first visit our site.
                  You can also change your preferences at any time by clearing your browser data and revisiting our site.
                </p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">In Your Browser</h4>
                <p className="text-gray-700 text-sm mb-3">
                  You can also control cookies through your browser settings:
                </p>
                <ul className="text-gray-700 text-sm ml-4 space-y-1">
                  <li>• <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li>• <strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
                  <li>• <strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li>• <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                <p className="text-gray-700 text-sm mb-2">
                  We use Google Analytics to understand how our website is used. Google Analytics may set cookies to collect information about your visit.
                </p>
                <p className="text-gray-700 text-sm">
                  Learn more: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Privacy Policy</a>
                  {' | '}
                  <a href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Cookies</a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights Under GDPR</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Right to Withdraw Consent</h4>
                  <p className="text-sm text-gray-700">You can withdraw your consent for analytics and marketing cookies at any time.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Access</h4>
                  <p className="text-sm text-gray-700">You can request information about what data we have collected about you.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Erasure</h4>
                  <p className="text-sm text-gray-700">You can request deletion of your personal data ("right to be forgotten").</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Right to Rectification</h4>
                  <p className="text-sm text-gray-700">You can request correction of inaccurate personal data.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Object</h4>
                  <p className="text-sm text-gray-700">You can object to certain types of data processing.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Data Portability</h4>
                  <p className="text-sm text-gray-700">You can request a copy of your data in a portable format.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 mb-3">
                If you have questions about our use of cookies or want to exercise your GDPR rights, please contact us:
              </p>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Email:</strong> aj@practiceqs.com</p>
                <p><strong>Subject:</strong> Cookie Policy / GDPR Inquiry</p>
                <p>
                  <strong>Contact Form:</strong>{' '}
                  <button 
                    onClick={() => navigate('/contact')}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    Use our contact form
                  </button>
                </p>
              </div>
            </div>
          </section>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-500">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This policy may be updated periodically. Please check back for the latest version.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy; 