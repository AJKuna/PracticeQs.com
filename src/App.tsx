import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import BetaLanding from './components/BetaLanding';
import LandingPage from './components/LandingPage';
import QuestionGenerator from './components/QuestionGenerator';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import Contact from './components/Contact';

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
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <img 
            src="/logo.svg" 
            alt="PracticeQs Logo" 
            className="h-16 w-auto mx-auto"
          />
        </div>
        
        {/* Main message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Coming Soon!
          </h1>
          <p className="text-gray-600 mb-4">
            We're currently testing PracticeQs to ensure the best experience for our users.
          </p>
          <p className="text-gray-500 text-sm">
            The site will be available to the public very soon. Thank you for your patience!
          </p>
        </div>
        
        {/* Features preview */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">What's Coming:</h3>
          <ul className="text-xs text-blue-800 space-y-1 text-left">
            <li>• AI-powered GCSE exam questions</li>
            <li>• Multiple subjects and exam boards</li>
            <li>• Detailed marking schemes</li>
            <li>• PDF export functionality</li>
          </ul>
        </div>
        
        {/* Contact info */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 mb-2">
            Want to be notified when we launch?
          </p>
          <a 
            href="mailto:aj@practiceqs.com" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Contact us
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
        <StagingGate>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<BetaLanding />} />
            <Route path="/lander" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/contact" element={<Contact />} />

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
      </Router>
    </AuthProvider>
  );
}

export default App;
