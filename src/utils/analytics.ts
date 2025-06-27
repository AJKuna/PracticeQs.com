// Google Analytics 4 Event Tracking Utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Track page views
export const trackPageView = (page_title: string, page_location: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-DCGHWTTXXQ', {
      page_title,
      page_location,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track question generation
export const trackQuestionGeneration = (subject: string, topic: string, count: number, difficulty: string) => {
  trackEvent('generate_questions', 'questions', `${subject} - ${topic} - ${difficulty}`, count);
};

// Track PDF exports
export const trackPDFExport = (subject: string, topic: string, questionCount: number) => {
  trackEvent('export_pdf', 'questions', `${subject} - ${topic}`, questionCount);
};

// Track subscription events
export const trackSubscription = (action: 'upgrade_clicked' | 'subscription_completed' | 'subscription_cancelled', plan?: string) => {
  trackEvent(action, 'subscription', plan);
};

// Track user authentication
export const trackAuth = (action: 'sign_up' | 'sign_in' | 'sign_out', method?: string) => {
  trackEvent(action, 'auth', method);
};

// Track contact form
export const trackContactForm = (action: 'submit' | 'success' | 'error') => {
  trackEvent(`contact_${action}`, 'contact');
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('click', 'button', `${buttonName} - ${location}`);
};

// Track errors
export const trackError = (errorType: string, errorMessage: string, location: string) => {
  trackEvent('error', errorType, `${location}: ${errorMessage}`);
};

// Track user engagement
export const trackEngagement = (action: string, detail?: string) => {
  trackEvent(action, 'engagement', detail);
}; 