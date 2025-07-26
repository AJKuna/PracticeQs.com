import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import BetaLanding from './components/BetaLanding';
import LandingPage from './components/LandingPage';
import NewLandingPage from './components/NewLandingPage';
import QuestionGenerator from './components/QuestionGenerator';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import Contact from './components/Contact';
import CookiePolicy from './components/CookiePolicy';
import CookieConsent from './components/CookieConsent';
// SEO-optimized landing pages
import MathsQuestionsPage from './components/MathsQuestionsPage';
import { consentManager, updateConsent, type CookiePreferences } from './utils/consentManager';
import { initializeGoogleAnalytics, trackConsentEvent } from './utils/analytics';

// GDPR Consent Wrapper Component
const GDPRWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize Google Analytics with consent mode
    initializeGoogleAnalytics();
    
    // Apply existing consent if available
    if (consentManager.hasConsent()) {
      consentManager.applyConsent();
    }
  }, []);

  const handleConsentUpdate = (preferences: CookiePreferences) => {
    updateConsent(preferences);
    
    // Track consent event
    const consentTypes = [];
    if (preferences.analytics) consentTypes.push('analytics');
    if (preferences.marketing) consentTypes.push('marketing');
    
    trackConsentEvent(
      consentTypes.length > 0 ? 'consent_given' : 'consent_denied', 
      consentTypes.join(', ') || 'none'
    );
  };

  return (
    <>
      {children}
      <CookieConsent onAccept={handleConsentUpdate} />
    </>
  );
};

// Staging Mode Component
const StagingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  // Check if site is live to public
  const isLivePublic = import.meta.env.VITE_IS_LIVE_PUBLIC === 'true';
  const authorizedEmails = ['aj@practiceqs.com', 'aj-k121@outlook.com'];
  
  // Allow access to authentication pages even in staging mode
  const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isAuthPage = authPages.includes(location.pathname);
  
  // If site is live to public, always show content
  if (isLivePublic) {
    return <>{children}</>;
  }
  
  // If on an auth page, allow access even in staging mode
  if (isAuthPage) {
    return (
      <>
        {/* Staging Banner for auth pages */}
        <div className="bg-orange-100 border-b border-orange-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-orange-800 text-sm font-medium text-center">
              🧪 <strong>STAGING MODE:</strong> Site is in testing. Authorized emails: {authorizedEmails.join(', ')}
            </p>
          </div>
        </div>
        {children}
      </>
    );
  }
  
  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is logged in and is an authorized user, allow access
  if (user && (authorizedEmails.includes(user.email || '') || authorizedEmails.includes(profile?.email || ''))) {
    return (
      <>
        {/* Staging Banner for authorized users */}
        <div className="bg-orange-100 border-b border-orange-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-orange-800 text-sm font-medium text-center">
              🧪 <strong>STAGING MODE:</strong> You're viewing the site in testing mode. 
              The public cannot access this yet.
            </p>
          </div>
        </div>
        {children}
      </>
    );
  }
  
  // For everyone else, show the staging message
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <img
            className="mx-auto h-16 w-auto"
            src="/logo.svg"
            alt="Practice Qs"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🚧 Coming Soon
        </h1>
        
        <p className="text-gray-600 mb-6">
          Practice Qs is currently in development. We're working hard to bring you the best 
          question generation experience for educational purposes.
        </p>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Want early access? Contact us:
          </div>
          <a
            href="mailto:aj@practiceqs.com"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GDPRWrapper>
          <StagingGate>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<NewLandingPage />} />
              <Route path="/beta" element={<BetaLanding />} />
              <Route path="/lander" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<LandingPage />} />
              
              {/* SEO-optimized landing pages */}
              <Route path="/maths-questions" element={<MathsQuestionsPage />} />
              <Route path="/practice-questions" element={<Navigate to="/" replace />} />
              <Route path="/gcse-practice" element={<Navigate to="/" replace />} />
              <Route path="/custom-worksheets" element={<Navigate to="/" replace />} />
              <Route path="/generate-questions" element={<Navigate to="/" replace />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Legal pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cookies" element={<CookiePolicy />} />

              {/* Protected routes */}
              <Route
                path="/generator/:subject"
                element={
                  <ProtectedRoute>
                    <QuestionGenerator />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </StagingGate>
        </GDPRWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;
