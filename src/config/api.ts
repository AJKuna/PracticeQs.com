// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://practiceqscom-production.up.railway.app';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    CONTACT: `${API_BASE_URL}/api/contact`,
    CREATE_PORTAL_SESSION: `${API_BASE_URL}/api/create-portal-session`,
    CREATE_CHECKOUT_SESSION: `${API_BASE_URL}/api/create-checkout-session`,
    STRIPE_WEBHOOK: `${API_BASE_URL}/api/stripe-webhook`,
  }
};

export default API_CONFIG; 