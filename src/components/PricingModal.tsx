import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for successful payment on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade') === 'success') {
      // Payment was successful, wait a moment then refresh profile multiple times
      // to ensure we get the updated data from the webhook
      console.log('🎉 Payment successful, refreshing profile...');
      
      const refreshWithRetry = async (attemptCount = 0) => {
        const maxAttempts = 5;
        const delay = Math.min(1000 * Math.pow(2, attemptCount), 10000); // Exponential backoff up to 10s
        
        console.log(`🔄 Profile refresh attempt ${attemptCount + 1}/${maxAttempts}`);
        
        // Wait before attempting refresh
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
          await refreshProfile();
          
          // Check if profile was updated to premium
          // Note: We need to check the profile state after refresh
          // Since refreshProfile is async, we'll check in the next render cycle
          setTimeout(() => {
            // Get the updated profile from context
            const updatedProfile = profile;
            if (updatedProfile?.subscription_tier === 'premium') {
              console.log('✅ Profile successfully updated to premium');
              onClose();
            } else if (attemptCount < maxAttempts - 1) {
              console.log('⏳ Profile not yet updated, retrying...');
              refreshWithRetry(attemptCount + 1);
            } else {
              console.log('⚠️ Profile update verification failed after max attempts');
              // Still close modal but could show a message
              onClose();
            }
          }, 500);
          
        } catch (error) {
          console.error('❌ Error refreshing profile:', error);
          if (attemptCount < maxAttempts - 1) {
            refreshWithRetry(attemptCount + 1);
          } else {
            onClose(); // Close anyway after max attempts
          }
        }
      };
      
      refreshWithRetry();
      
      // Clean up URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshProfile, onClose, profile]);

  if (!isOpen) return null;

  // Don't show modal if user is already premium
  if (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'enterprise') {
    return null;
  }

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const checkoutUrl = await createStripeCheckoutSession({
        userId: user.id,
        priceType: isYearly ? 'yearly' : 'monthly',
        successUrl: `${window.location.origin}?upgrade=success`,
        cancelUrl: `${window.location.origin}?upgrade=cancelled`
      });
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // You could show a toast notification here
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create Stripe checkout session
  const createStripeCheckoutSession = async (params: {
    userId: string;
    priceType: 'monthly' | 'yearly';
    successUrl: string;
    cancelUrl: string;
  }) => {
    const response = await fetch(API_CONFIG.ENDPOINTS.CREATE_CHECKOUT_SESSION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }
    
    const { url } = await response.json();
    return url;
  };

  const monthlyPrice = 5;
  const yearlyPrice = 40;
  const yearlyMonthlyEquivalent = Math.round((yearlyPrice / 12) * 100) / 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upgrade your plan</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 p-2 rounded-lg border border-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center p-6 pb-4">
          <div className="bg-white rounded-lg p-1 flex border border-gray-200">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isYearly
                  ? 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'bg-white text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isYearly
                  ? 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'bg-white text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 p-6 pt-2">
          {/* Free Plan - Current */}
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 relative">
            <div className="absolute top-4 right-4">
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                Current Plan
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-gray-900">
                £0<span className="text-base font-normal text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">30 questions per day</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-500">Slower response times</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-500">No priority access</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full bg-white text-gray-600 py-3 px-4 rounded-lg font-medium border border-gray-300 cursor-not-allowed hover:bg-gray-50"
            >
              Your current plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="border-2 border-blue-500 rounded-xl p-6 bg-white relative shadow-lg">
            <div className="absolute top-4 right-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-3xl font-bold text-gray-900">
                £{isYearly ? yearlyMonthlyEquivalent : monthlyPrice}
                <span className="text-base font-normal text-gray-600">
                  /month{isYearly ? ' (billed annually)' : ''}
                </span>
              </div>
              {isYearly && (
                <div className="text-sm text-gray-600 mt-1">
                  £{yearlyPrice} billed annually
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 font-medium">Unlimited questions per day</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">No wait times between requests</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Try beta features early</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>

            <div className="mb-4">
              <p className="text-sm text-gray-600 text-center">Unlock faster, smarter question generation for teaching and learning.</p>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                `Upgrade to Premium ${isYearly ? '- Save 33%' : ''}`
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <p className="text-xs text-gray-500 text-center">
            Have an existing plan? <a href="/contact" className="text-blue-600 hover:underline">Get in touch with us</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal; 