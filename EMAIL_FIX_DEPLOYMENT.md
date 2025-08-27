# Email Population Fix - Deployment Guide

## Issue Summary
New users were showing up with `null` email addresses in the `profiles` table, even though they authenticated with an email. This was happening because:

1. The database trigger function was missing or not properly populating the email field
2. Client-side profile creation was racing with the database trigger
3. There were conflicting migration files with different schemas

## Solution Overview
1. **Fixed Database Trigger**: Updated `handle_new_user()` function to properly populate email from `auth.users.email`
2. **Updated Existing Records**: Migration automatically populates null emails from `auth.users` table
3. **Simplified Client Code**: Reduced race conditions by relying on database trigger instead of client-side creation

## Deployment Steps

### 1. Apply Database Migration

**Option A: Using Supabase CLI (Recommended)**
```bash
cd /path/to/your/project
supabase db push
```

**Option B: Manual SQL Execution**
Run the contents of `supabase/migrations/20250116000001_fix_email_trigger.sql` in your Supabase SQL Editor.

### 2. Verify the Fix

After applying the migration, run these verification queries in Supabase SQL Editor:

```sql
-- Check if the trigger function exists and is correct
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check if any profiles still have null emails
SELECT COUNT(*) as null_email_count 
FROM profiles 
WHERE email IS NULL;

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('email', 'last_splash_shown');
```

### 3. Test with New User Signup

1. Create a test user account
2. Check that the profile is automatically created with the correct email
3. Verify `last_splash_shown` is properly set to `NULL` for new users

### 4. Deploy Frontend Changes

The updated `AuthContext.tsx` includes:
- Simplified profile creation logic
- Better error handling for missing profiles
- Reduced race conditions

## What Changed

### Database Changes (`20250116000001_fix_email_trigger.sql`)
- ✅ Adds `email` column if it doesn't exist (backward compatibility)
- ✅ Populates existing null emails from `auth.users` table
- ✅ Sets proper constraints (`NOT NULL`, `UNIQUE`)
- ✅ Updates trigger function to populate `email` and `last_splash_shown`
- ✅ Ensures trigger exists and uses updated function

### Client Changes (`AuthContext.tsx`)
- ✅ Simplified `createOrUpdateProfile` function
- ✅ Added fallback profile creation if trigger fails
- ✅ Better handling of existing users with null emails
- ✅ Reduced race conditions with 500ms delay

## Expected Results

After deployment:
- **New users**: Automatically get profiles with correct email and `last_splash_shown: null`
- **Existing users**: Null emails are populated from `auth.users` table
- **Splash screen**: Works correctly for both new and returning users
- **Reduced errors**: Fewer profile creation conflicts and race conditions

## Rollback Plan

If issues occur, you can rollback by:

1. **Reverting the trigger function:**
```sql
-- Restore previous trigger (without email population)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. **Reverting client code**: Restore the previous version of `AuthContext.tsx`

## Testing Checklist

- [ ] Migration applies without errors
- [ ] Existing null emails are populated
- [ ] New user signup creates profile with email
- [ ] Splash screen behavior is correct
- [ ] No profile creation errors in console
- [ ] Email uniqueness constraint works
