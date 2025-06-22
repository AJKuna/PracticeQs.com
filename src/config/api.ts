// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://practiceqscom-production.up.railway.app';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    CONTACT: `${API_BASE_URL}/api/contact`,
    CREATE_PORTAL_SESSION: `${API_BASE_URL}/api/create-portal-session`,
    CREATE_CHECKOUT_SESSION: `${API_BASE_URL}/api/create-checkout-session`,
    STRIPE_WEBHOOK: `${API_BASE_URL}/api/stripe-webhook`,
    GENERATE_QUESTIONS: `${API_BASE_URL}/api/generate-questions`,
    GENERATE_SOLUTIONS: `${API_BASE_URL}/api/generate-solutions`,
    USAGE: (userId: string) => `${API_BASE_URL}/api/usage/${userId}`,
  }
};

export default API_CONFIG; 