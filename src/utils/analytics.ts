// Google Analytics 4 Event Tracking Utilities with GDPR Compliance

import { hasAnalyticsConsent } from './consentManager';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics with consent mode
export const initializeGoogleAnalytics = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Set default consent state
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      wait_for_update: 500,
    });
  }
};

// Track page views (only if consent is given)
export const trackPageView = (page_title: string, page_location: string) => {
  if (typeof window !== 'undefined' && window.gtag && hasAnalyticsConsent()) {
    window.gtag('config', 'G-DCGHWTTXXQ', {
      page_title,
      page_location,
    });
  }
};

// Track custom events (only if consent is given)
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag && hasAnalyticsConsent()) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track question generation
export const trackQuestionGeneration = (subject: string, topic: string, count: number, difficulty: string) => {
  if (hasAnalyticsConsent()) {
    trackEvent('generate_questions', 'questions', `${subject} - ${topic} - ${difficulty}`, count);
  }
};

// Track PDF exports
export const trackPDFExport = (subject: string, topic: string, questionCount: number) => {
  if (hasAnalyticsConsent()) {
    trackEvent('export_pdf', 'questions', `${subject} - ${topic}`, questionCount);
  }
};

// Track subscription events
export const trackSubscription = (action: 'upgrade_clicked' | 'subscription_completed' | 'subscription_cancelled', plan?: string) => {
  if (hasAnalyticsConsent()) {
    trackEvent(action, 'subscription', plan);
  }
};

// Track user authentication
export const trackAuth = (action: 'sign_up' | 'sign_in' | 'sign_out', method?: string) => {
  if (hasAnalyticsConsent()) {
    trackEvent(action, 'auth', method);
  }
};

// Track contact form
export const trackContactForm = (action: 'submit' | 'success' | 'error') => {
  if (hasAnalyticsConsent()) {
    trackEvent(`contact_${action}`, 'contact');
  }
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  if (hasAnalyticsConsent()) {
    trackEvent('click', 'button', `${buttonName} - ${location}`);
  }
};

// Track errors
export const trackError = (errorType: string, errorMessage: string, location: string) => {
  if (hasAnalyticsConsent()) {
    trackEvent('error', errorType, `${location}: ${errorMessage}`);
  }
};

// Track user engagement
export const trackEngagement = (action: string, detail?: string) => {
  if (hasAnalyticsConsent()) {
    trackEvent(action, 'engagement', detail);
  }
};

// Track consent events (these are always tracked for compliance purposes)
export const trackConsentEvent = (action: 'consent_given' | 'consent_denied' | 'consent_changed', details?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Track consent events without checking for consent (for compliance monitoring)
    window.gtag('event', action, {
      event_category: 'gdpr_consent',
      event_label: details,
      send_to: 'G-DCGHWTTXXQ'
    });
  }
}; 