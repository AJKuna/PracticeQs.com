import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, profileLoading } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // Check for successful payment on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgrade') === 'success') {
      console.log('🎉 Payment successful detected');
      setPaymentStatus('success');
      
      // Clean up URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success state and close modal after a brief delay
      setTimeout(() => {
        if (profile?.subscription_tier === 'premium') {
          console.log('✅ Profile confirmed as premium, closing modal');
          onClose();
        } else {
          // If profile hasn't updated yet, show success message but don't close
          // The user can manually close or it will close when profile updates
          console.log('⏳ Profile not yet updated to premium, showing success state');
        }
      }, 2000);
    } else if (urlParams.get('upgrade') === 'cancelled') {
      console.log('❌ Payment cancelled');
      setPaymentStatus('failed');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [profile?.subscription_tier, onClose]);

  // Auto-close modal when user becomes premium
  useEffect(() => {
    if (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'enterprise') {
      if (paymentStatus === 'success' || paymentStatus === 'processing') {
        console.log('✅ User is now premium, closing modal');
        onClose();
      }
    }
  }, [profile?.subscription_tier, paymentStatus, onClose]);

  if (!isOpen) return null;

  // Don't show modal if user is already premium
  if (profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'enterprise') {
    return null;
  }

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setPaymentStatus('processing');
    
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
      setPaymentStatus('failed');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upgrade to Premium</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Payment Status Messages */}
          {paymentStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-medium">Payment successful!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                {profileLoading ? 'Updating your account...' : 'Your account has been upgraded to Premium.'}
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-red-800 font-medium">Payment cancelled</span>
              </div>
              <p className="text-red-700 text-sm mt-1">No charges were made to your account.</p>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-6">
            <span className={`mr-3 ${!isYearly ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isYearly ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${isYearly ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="ml-2 text-sm text-green-600 font-medium">Save 33%</span>
            )}
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
                  <span className="text-gray-700">15 questions per day</span>
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
                disabled={isLoading || paymentStatus === 'processing'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || paymentStatus === 'processing' ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    </div>
  );
};

export default PricingModal; 