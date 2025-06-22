# 🚀 Production Webhook Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (Critical)

**Backend (Railway):**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxx                    # Live secret key (starts with sk_live_)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx                  # Live webhook secret (starts with whsec_)
STRIPE_MONTHLY_PRICE_ID=price_xxxxx                # Live monthly price ID
STRIPE_YEARLY_PRICE_ID=price_xxxxx                 # Live yearly price ID

# Supabase Configuration  
SUPABASE_URL=https://xxxxx.supabase.co             # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx                 # Service role key (NOT anon key)

# Staging Mode Control
IS_LIVE_PUBLIC=false                               # Set to 'true' when ready for public access

# Optional
NODE_ENV=production
PORT=5050
```

**Frontend (Vercel):**
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx                    # Anon/public key
VITE_API_URL=https://practiceqscom-production.up.railway.app
VITE_IS_LIVE_PUBLIC=false                          # Set to 'true' when ready for public access
```

### 2. Stripe Webhook Configuration

1. **Create Live Webhook Endpoint in Stripe Dashboard:**
   - URL: `https://practiceqscom-production.up.railway.app/api/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Copy the webhook signing secret** and set it as `STRIPE_WEBHOOK_SECRET`

### 3. Database Verification

Ensure your Supabase database has the correct schema:

```sql
-- Verify profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Required columns:
-- subscription_tier (enum: 'free', 'premium', 'enterprise')
-- subscription_status (enum: 'active', 'cancelled', 'expired', 'trial')
-- subscription_start_date (timestamp with time zone)
-- subscription_end_date (timestamp with time zone)
-- daily_question_limit (integer)
```

## 🧪 Testing Your Deployment

### Step 1: Run the Test Script

```bash
# In your project root
node test-webhook.js

# Or test with a specific user
node test-webhook.js <user-id>
```

### Step 2: Test Webhook Manually

```bash
# Test webhook endpoint is accessible
curl -X GET https://practiceqscom-production.up.railway.app/api/stripe-webhook
# Should return 405 Method Not Allowed (this is expected for GET requests)
```

### Step 3: Monitor Logs

**Railway Backend Logs:**
```bash
# Check these log messages appear:
✅ Supabase client initialized successfully
🔑 Checking Stripe configuration...
🎯 Webhook received (when webhooks fire)
✅ Webhook signature verified successfully
💳 Processing checkout completion...
✅ Successfully updated user profile in Supabase
```

**Stripe Dashboard:**
- Go to Developers > Webhooks
- Click on your webhook endpoint  
- Check "Recent deliveries" tab for successful/failed attempts

## 🔧 Troubleshooting Common Issues

### Issue 1: Webhook Not Receiving Events
**Symptoms:** No webhook logs in Railway dashboard

**Solutions:**
1. Verify webhook URL is correct in Stripe dashboard
2. Check Railway service is deployed and running
3. Ensure webhook endpoint path is `/api/stripe-webhook`
4. Test endpoint manually: `curl -X GET [your-railway-url]/api/stripe-webhook`

### Issue 2: Webhook Signature Verification Fails
**Symptoms:** `❌ Webhook signature verification failed`

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` is set correctly in Railway
2. Ensure you're using the **live** webhook secret (starts with `whsec_`)
3. Check for extra whitespace or invisible characters
4. Restart Railway service after changing environment variables

### Issue 3: Database Update Fails
**Symptoms:** `❌ Error updating user subscription in Supabase`

**Solutions:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
2. Check user ID exists in profiles table
3. Verify profiles table has required columns
4. Check Supabase logs for RLS policy issues
5. Test database connection with the test script

### Issue 4: User Profile Not Refreshing
**Symptoms:** UI still shows "Upgrade" button after successful payment

**Solutions:**
1. Check browser developer console for errors
2. Verify frontend is calling `refreshProfile()` after payment
3. Check if webhook updated the database successfully
4. Clear browser cache/localStorage
5. Test profile refresh manually in browser console:
   ```javascript
   // In browser console after login
   const { refreshProfile } = useAuth();
   await refreshProfile();
   ```

### Issue 5: Client Reference ID Missing
**Symptoms:** `❌ No userId found in session client_reference_id`

**Solutions:**
1. Verify checkout session creation includes `client_reference_id: userId`
2. Check user is logged in when creating checkout session
3. Ensure user ID is valid UUID format
4. Check checkout session creation logs

## 🚨 Emergency Fixes

### Quick Database Update (Manual)
If webhook fails but payment succeeded, manually update user:

```sql
-- Replace with actual user email/ID
UPDATE profiles 
SET 
  subscription_tier = 'premium',
  subscription_status = 'active',
  subscription_start_date = NOW(),
  subscription_end_date = NOW() + INTERVAL '1 month',
  daily_question_limit = NULL,
  updated_at = NOW()
WHERE email = 'user@example.com';
```

### Webhook Retry
Failed webhooks will be retried by Stripe automatically. You can also:
1. Go to Stripe Dashboard > Webhooks
2. Find the failed event
3. Click "Resend" to retry

## 📊 Health Check URLs

- **Backend Health:** `https://practiceqscom-production.up.railway.app/api/stripe-webhook` (should return 405)
- **Frontend:** `https://practiceqs.com`

## 🔍 Debug Commands

```bash
# Test webhook in production
node test-webhook.js

# Check environment variables
echo $STRIPE_WEBHOOK_SECRET | wc -c  # Should be ~64 characters

# Verify Supabase connection
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     "$SUPABASE_URL/rest/v1/profiles?select=count"
```

## ✅ Final Deployment Steps

1. **Deploy backend to Railway** with all environment variables
2. **Test webhook endpoint** accessibility  
3. **Configure Stripe webhook** with production URL
4. **Deploy frontend to Vercel** with environment variables
5. **Run test script** to verify everything works
6. **Perform test purchase** with test user
7. **Monitor logs** during test purchase
8. **Verify database update** and UI refresh

---

## 📞 Support

If issues persist:
1. Check Railway and Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test each component individually using the test script
4. Check Stripe webhook delivery logs for error details

**Remember:** Webhook events can take 1-2 seconds to process. The frontend retry logic should handle this delay automatically.

## 🧪 Staging Mode

The site includes a staging mode that allows you to test in production while keeping the site private:

### How it works:
- **When `IS_LIVE_PUBLIC=false`:**
  - Only you (aj@practiceqs.com) can access the full site
  - Other users see a "Coming Soon" page
  - You'll see an orange banner indicating staging mode
  - Backend APIs are protected (only your account can make requests)

- **When `IS_LIVE_PUBLIC=true`:**
  - Site is fully public and accessible to everyone
  - No restrictions or staging messages

### To go live:
1. Set `IS_LIVE_PUBLIC=true` in Railway backend
2. Set `VITE_IS_LIVE_PUBLIC=true` in Vercel frontend  
3. Redeploy both services

### Testing staging mode:
1. Deploy with `IS_LIVE_PUBLIC=false`
2. Visit site logged out → should see "Coming Soon" page
3. Login with aj@practiceqs.com → should see full site with staging banner
4. Test all functionality works normally
5. When ready, set both env vars to `true` and redeploy 