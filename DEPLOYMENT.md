# Deployment Guide

## 🚀 Production Deployment Checklist

### ✅ **COMPLETED** - Critical Issues Fixed

1. **Environment Configuration** ✅
   - Created `src/config/api.ts` for centralized API configuration
   - Environment variables now properly configured
   - Hardcoded localhost URLs removed from all components

2. **API Endpoints Fixed** ✅
   - `src/components/Contact.tsx` - Uses `API_CONFIG.ENDPOINTS.CONTACT`
   - `src/components/LandingPage.tsx` - Uses `API_CONFIG.ENDPOINTS.CREATE_PORTAL_SESSION`
   - `src/components/PricingModal.tsx` - Uses `API_CONFIG.ENDPOINTS.CREATE_CHECKOUT_SESSION`
   - `vite.config.ts` - Uses environment variable for proxy target

3. **Code Cleanup** ✅
   - Removed production console.log statements
   - Kept console.error statements for debugging

---

## 🔧 Frontend Deployment Steps

### 1. Environment Variables Setup
Create a `.env` file in your production environment with:

```env
# Production Frontend Environment Variables
VITE_API_URL=https://your-backend-domain.com
VITE_PORT=3000

# Supabase (already configured in code)
VITE_SUPABASE_URL=https://cboijvvxucdlrpxekfwf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2lqdnZ4dWNkbHJweGVrZndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDE0NjgsImV4cCI6MjA2NTQxNzQ2OH0.1rjCBQCz8zTEDQlJe1UYBUWZWGZHk3kznPRnxqU_3xg
```

### 2. Build Commands
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Serve built files (if needed)
npm run preview
```

### 3. Deployment Platforms

#### **Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-domain.com
```

#### **Netlify**
```bash
# Build command: npm run build
# Publish directory: dist
# Set environment variables in Netlify dashboard
```

#### **Railway**
```bash
# railway.json
{
  "build": {
    "command": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview"
  }
}
```

---

## 🖥️ Backend Deployment Steps

### 1. Environment Variables Setup
Create environment variables in your backend deployment:

```env
# Backend Environment Variables
PORT=5050
NODE_ENV=production

# Database
SUPABASE_URL=https://cboijvvxucdlrpxekfwf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2lqdnZ4dWNkbHJweGVrZndmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg0MTQ2OCwiZXhwIjoyMDY1NDE3NDY4fQ.9LAfc2MEWqNbFa_aC_J40LEihxNsnB78EO3Hm8zK0rY

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
FROM_EMAIL=your_from_email
FROM_NAME=your_from_name
```

### 2. Deploy Backend
Choose your platform:

#### **Railway**
```bash
# Connect GitHub repo to Railway
# Set environment variables in dashboard
# Deploy automatically on push
```

#### **Render**
```bash
# Build command: npm install
# Start command: node server.js
# Set environment variables in dashboard
```

#### **Heroku**
```bash
# Create Procfile
echo "web: node server.js" > Backend/Procfile

# Deploy
heroku create your-app-name
git subtree push --prefix=Backend heroku main
```

---

## 🔌 Stripe Webhook Configuration

### ⚠️ **CRITICAL**: Update Stripe Webhook URL

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. **Update** your webhook endpoint URL to:
   ```
   https://your-backend-domain.com/api/stripe-webhook
   ```
4. **Events to listen for**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded` 
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Testing Webhook
```bash
# Test webhook with Stripe CLI
stripe listen --forward-to https://your-backend-domain.com/api/stripe-webhook
```

---

## 🗄️ Database Status

### ✅ **READY** - Supabase Configuration
- **Database**: Already configured and ready
- **Tables**: All tables exist and properly configured
- **RLS Policies**: Security policies in place
- **API Keys**: Configured for both client and server access

---

## 🔍 Post-Deployment Verification

### Frontend Checklist
- [ ] Website loads without errors
- [ ] User registration/login works
- [ ] Subject selection works
- [ ] Question generation works
- [ ] Pricing modal functions correctly
- [ ] All API calls work with new backend URL

### Backend Checklist
- [ ] Server responds to health checks
- [ ] API endpoints return correct responses
- [ ] Database connections work
- [ ] Stripe webhook receives events
- [ ] Email sending works
- [ ] OpenAI integration functions

### Integration Testing
- [ ] Complete user signup flow
- [ ] Premium upgrade process
- [ ] Question generation for free/premium users
- [ ] Subscription management works
- [ ] Payment confirmations update user status

---

## 🚨 Important Notes

1. **Webhook Timing**: After payment, it may take a few seconds for the webhook to update the user's subscription status in Supabase.

2. **CORS Configuration**: Ensure your backend accepts requests from your frontend domain.

3. **SSL Required**: Both frontend and backend must use HTTPS in production.

4. **Rate Limiting**: Consider implementing rate limiting on your API endpoints.

5. **Monitoring**: Set up monitoring and logging for production issues.

---

## 🔧 Environment-Specific Configurations

### Development
```env
VITE_API_URL=http://localhost:5050
```

### Staging  
```env
VITE_API_URL=https://staging-api.yourdomain.com
```

### Production
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 📞 Support

If you encounter issues during deployment:

1. Check the browser console for frontend errors
2. Check server logs for backend errors  
3. Verify all environment variables are set correctly
4. Test Stripe webhook with ngrok locally first
5. Ensure database connections are working

**Your application is now ready for production deployment!** 🎉 