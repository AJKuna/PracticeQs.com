# Deployment Guide - PracticeQs.com

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

## 🔧 Frontend Deployment Steps (Vercel)

### 1. Environment Variables Setup
Set these environment variables in your Vercel dashboard:

```env
# Production Frontend Environment Variables
VITE_API_URL=https://api.practiceqs.com

# Supabase (already configured in code)
VITE_SUPABASE_URL=https://cboijvvxucdlrpxekfwf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib2lqdnZ4dWNkbHJweGVrZndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDE0NjgsImV4cCI6MjA2NTQxNzQ2OH0.1rjCBQCz8zTEDQlJe1UYBUWZWGZHk3kznPRnxqU_3xg
```

### 2. Vercel Deployment Steps

1. **Connect GitHub Repository**
   ```bash
   # Repository: https://github.com/AJKuna/PracticeQs.com
   # Branch: main
   ```

2. **Vercel Configuration**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Custom Domain Setup**
   - Add `practiceqs.com` as custom domain in Vercel
   - Add `www.practiceqs.com` (redirect to main domain)
   - Vercel will automatically handle SSL certificates

4. **Environment Variables in Vercel Dashboard**
   ```
   VITE_API_URL = https://api.practiceqs.com
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

### 2. Recommended Backend Deployment
Deploy your backend to `api.practiceqs.com` using:

#### **Railway** (Recommended)
```bash
# Connect GitHub repo to Railway
# Set environment variables in dashboard
# Deploy automatically on push
# Custom domain: api.practiceqs.com
```

#### **Render**
```bash
# Build command: npm install
# Start command: node server.js
# Set environment variables in dashboard
# Custom domain: api.practiceqs.com
```

---

## 🔌 Stripe Webhook Configuration

### ⚠️ **CRITICAL**: Update Stripe Webhook URL

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. **Update** your webhook endpoint URL to:
   ```
   https://api.practiceqs.com/api/stripe-webhook
   ```
4. **Events to listen for**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded` 
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

## 🌐 Domain Configuration

### Frontend (Vercel)
- **Primary Domain**: `practiceqs.com`
- **Redirect**: `www.practiceqs.com` → `practiceqs.com`

### Backend (Railway/Render)
- **API Domain**: `api.practiceqs.com`
- **CORS Origins**: `https://practiceqs.com`, `https://www.practiceqs.com`

---

## 🔍 Post-Deployment Verification

### Frontend Checklist
- [ ] `https://practiceqs.com` loads without errors
- [ ] User registration/login works
- [ ] Subject selection works
- [ ] Question generation works
- [ ] Pricing modal functions correctly
- [ ] All API calls work with backend at `api.practiceqs.com`

### Backend Checklist
- [ ] `https://api.practiceqs.com` responds to health checks
- [ ] API endpoints return correct responses
- [ ] Database connections work
- [ ] Stripe webhook receives events at `api.practiceqs.com/api/stripe-webhook`
- [ ] Email sending works
- [ ] OpenAI integration functions

### Integration Testing
- [ ] Complete user signup flow
- [ ] Premium upgrade process works
- [ ] Question generation for free/premium users
- [ ] Subscription management works
- [ ] Payment confirmations update user status

---

## 🚨 Important Notes

1. **Domain Setup**: Ensure both `practiceqs.com` and `api.practiceqs.com` are properly configured
2. **CORS Configuration**: Backend must accept requests from `practiceqs.com`
3. **SSL Required**: Both domains must use HTTPS
4. **Webhook Timing**: After payment, webhook updates may take a few seconds

---

## 📞 Production URLs

- **Frontend**: https://practiceqs.com
- **Backend API**: https://api.practiceqs.com
- **Stripe Webhook**: https://api.practiceqs.com/api/stripe-webhook

**Your PracticeQs.com application is ready for production deployment!** 🎉 