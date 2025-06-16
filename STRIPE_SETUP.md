# Stripe Payment Integration Setup Guide

This guide walks you through setting up Stripe payments for your question generator application.

## Prerequisites

1. Stripe Account ([sign up here](https://dashboard.stripe.com/register))
2. Supabase project with the database schema already set up
3. Backend server running Node.js/Express

## Step 1: Stripe Dashboard Configuration

### 1.1 Create Products and Prices

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**
3. Create two products:

**Premium Monthly**
- Name: "Premium Monthly"
- Description: "Unlimited questions per month"
- Price: £5.00 GBP
- Billing: Recurring monthly
- Copy the Price ID (starts with `price_`)

**Premium Yearly**
- Name: "Premium Yearly" 
- Description: "Unlimited questions per year"
- Price: £40.00 GBP
- Billing: Recurring yearly
- Copy the Price ID (starts with `price_`)

### 1.2 Configure Webhooks

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Set endpoint URL: `https://yourdomain.com/api/stripe-webhook`
3. Select events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook signing secret** (starts with `whsec_`)

### 1.3 Get API Keys

1. Go to **Developers** → **API keys**
2. Copy your **Secret key** (starts with `sk_test_` for test mode)
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)

## Step 2: Environment Variables

Create a `.env` file in your Backend directory with the following variables:

```env
# Existing variables...
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id_here
STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id_here

# Application Configuration
NODE_ENV=development
PORT=5050
```

## Step 3: Install Dependencies

Run the following command in your Backend directory:

```bash
npm install stripe
```

## Step 4: Test the Integration

### 4.1 Test Payment Flow

1. Start your backend server: `npm run dev`
2. Open your frontend application
3. Navigate to a subject and try to generate more than 30 questions
4. The pricing modal should appear
5. Click "Upgrade to Premium"
6. You should be redirected to Stripe Checkout

### 4.2 Test with Stripe Test Cards

Use these test card numbers in Stripe Checkout:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

### 4.3 Verify Webhook Reception

1. Make a test payment
2. Check your backend logs for webhook events
3. Verify the user's subscription status is updated in Supabase

## Step 5: Go Live

### 5.1 Switch to Live Mode

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Get your live API keys and webhook secret
3. Update your production environment variables
4. Re-create products and webhooks in live mode

### 5.2 Update Webhook Endpoint

Make sure your webhook endpoint is accessible from the internet:
- Use a service like ngrok for local testing
- Deploy to production with HTTPS enabled

## API Endpoints

The integration adds these new endpoints to your backend:

- `POST /api/create-checkout-session` - Creates Stripe checkout session
- `POST /api/stripe-webhook` - Handles Stripe webhooks
- `POST /api/create-portal-session` - Creates customer portal session
- `POST /api/cancel-subscription` - Cancels user subscription

## Database Changes

The webhook handlers automatically update these Supabase tables:

- **profiles**: Updates subscription tier, status, and dates
- **subscription_history**: Logs all subscription changes
- **usage_logs**: Daily usage tracking (unchanged)

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is correct and accessible
   - Verify webhook secret matches environment variable
   - Check Stripe Dashboard webhook logs

2. **Payment succeeds but user not upgraded**
   - Check backend logs for webhook processing errors
   - Verify Supabase permissions and schema
   - Check user ID is correctly passed in metadata

3. **Checkout session creation fails**
   - Verify Stripe API keys are correct
   - Check price IDs match your Stripe products
   - Ensure user profile exists in database

### Testing Webhooks Locally

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
# Then forward events to your local server
stripe listen --forward-to localhost:5050/api/stripe-webhook
```

## Security Considerations

1. **Always verify webhook signatures** - The implementation includes signature verification
2. **Use HTTPS in production** - Stripe requires HTTPS for live webhooks
3. **Validate user permissions** - Check user authentication before processing payments
4. **Store minimal data** - Don't store sensitive payment data in your database

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Supabase Documentation](https://supabase.com/docs) 