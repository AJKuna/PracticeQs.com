# Daily Limit Update: 30 → 15 Questions

## Summary
The daily question limit for free users has been reduced from 30 to 15 questions per day. This affects:
- ✅ **All current free users** (updated from 30 to 15)
- ✅ **All new users** (default set to 15)
- ✅ **Premium users** (still unlimited)

## What Changed

### 1. Database Schema
- Default value for `daily_question_limit` changed from 30 to 15
- Existing free users updated from 30 to 15 questions per day
- Premium users remain unlimited (null value)

### 2. Code Changes
- Backend validation messages updated
- Frontend UI text updated
- Error messages updated
- Pricing modal updated
- Landing page updated

## How to Apply Changes

### Option 1: Run the Migration (Recommended)
If you're using Supabase CLI:
```bash
supabase db push
```

### Option 2: Manual Database Update
1. Connect to your Supabase database
2. Run the verification query first:
   ```sql
   \i supabase/verify_daily_limit_update.sql
   ```
3. If the migration hasn't been applied, run:
   ```sql
   \i supabase/manual_daily_limit_update.sql
   ```

## Verification Steps

### 1. Check Current State
Run this query in your Supabase SQL editor:
```sql
SELECT 
    subscription_tier,
    daily_question_limit,
    COUNT(*) as user_count
FROM profiles 
GROUP BY subscription_tier, daily_question_limit
ORDER BY subscription_tier, daily_question_limit;
```

### 2. Expected Results
After the migration:
- **Free users**: `daily_question_limit = 15`
- **Premium users**: `daily_question_limit = null` (unlimited)
- **No users**: should have `daily_question_limit = 30`

### 3. Check Default Value
```sql
SELECT column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
    AND column_name = 'daily_question_limit';
```
Should return: `15`

## Files Created/Modified

### New Files:
- `supabase/migrations/20241201000000_update_daily_limit.sql` - Migration file
- `supabase/verify_daily_limit_update.sql` - Verification queries
- `supabase/manual_daily_limit_update.sql` - Manual update script

### Modified Files:
- `Backend/server.js` - Updated limits and error messages
- `src/components/QuestionGenerator.tsx` - Updated fallback values
- `src/components/PricingModal.tsx` - Updated pricing text
- `src/components/NewLandingPage.tsx` - Updated marketing text
- `src/contexts/AuthContext.tsx` - Updated default for new users
- `src/components/TermsAndConditions.tsx` - Updated terms
- `STRIPE_SETUP.md` - Updated testing instructions

## Impact on Users

### Current Users
- ✅ **Free users**: Automatically updated from 30 to 15 questions/day
- ✅ **Premium users**: No change (still unlimited)
- ✅ **Usage tracking**: Continues to work normally

### New Users
- ✅ **Free users**: Start with 15 questions/day
- ✅ **Premium users**: Unlimited questions

## Testing Checklist

After applying the changes, verify:
- [ ] Free users can generate up to 15 questions per day
- [ ] Premium users can generate unlimited questions
- [ ] Error message shows "Max 15 questions allowed" for free users
- [ ] Pricing modal shows "15 questions per day" for free tier
- [ ] Landing page shows "15 Free Questions a Day"
- [ ] New user accounts default to 15 questions per day

## Rollback (if needed)
If you need to rollback:
```sql
UPDATE profiles SET daily_question_limit = 30 WHERE subscription_tier = 'free';
ALTER TABLE profiles ALTER COLUMN daily_question_limit SET DEFAULT 30;
```

## Next Steps
1. **Verify the migration** using the verification queries
2. **Test the functionality** with a free user account
3. **Monitor usage** to ensure everything works correctly
4. **Deploy the frontend changes** to reflect the new limits 