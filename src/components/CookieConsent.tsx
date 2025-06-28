import React, { useState, useEffect } from 'react';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    let hasValidConsent = false;
    
    if (consent) {
      try {
        const consentData = JSON.parse(consent);
        // Check if consent data has the required structure
        hasValidConsent = consentData && 
                         consentData.preferences && 
                         typeof consentData.preferences.necessary !== 'undefined' &&
                         consentData.timestamp &&
                         consentData.version;
      } catch (error) {
        // Invalid JSON, treat as no consent
        hasValidConsent = false;
      }
    }
    
    if (!hasValidConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
    onAccept(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
    onAccept(preferences);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const rejected = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
    };
    saveConsent(rejected);
    onAccept(rejected);
    setShowBanner(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData = {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
  };

  const togglePreference = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              🍪 Cookie Preferences
            </h2>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <p className="text-gray-700 mb-6">
            We use cookies to enhance your experience on our website. You can choose which cookies to accept. 
            Necessary cookies are required for basic functionality and cannot be disabled.
          </p>

          {showDetails && (
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Necessary Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Required for basic website functionality, user authentication, and security.
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Always Active</span>
                  <div className="w-10 h-6 bg-green-500 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors interact with our website (Google Analytics).
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('analytics')}
                  className="flex items-center"
                >
                  <div className={`w-10 h-6 rounded-full ${preferences.analytics ? 'bg-blue-500' : 'bg-gray-300'} relative transition-colors`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${preferences.analytics ? 'transform translate-x-4' : 'transform translate-x-1'}`}></div>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Used to track visitors across websites for advertising purposes.
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('marketing')}
                  className="flex items-center"
                >
                  <div className={`w-10 h-6 rounded-full ${preferences.marketing ? 'bg-blue-500' : 'bg-gray-300'} relative transition-colors`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${preferences.marketing ? 'transform translate-x-4' : 'transform translate-x-1'}`}></div>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Accept All Cookies
            </button>
            <button
              onClick={handleAcceptSelected}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Accept Selected
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
            >
              Reject All
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            For more information, read our{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors">Privacy Policy</a> and{' '}
            <a href="/cookies" className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors">Cookie Policy</a>.
            You can change your preferences anytime in your browser settings.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 