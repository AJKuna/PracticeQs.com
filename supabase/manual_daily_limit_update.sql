-- Manual Daily Limit Update Script
-- Run this ONLY if the migration hasn't been applied yet
-- This script will update existing users from 30 to 15 questions per day

-- Step 1: Check current state before changes
SELECT 'BEFORE UPDATE - Current daily limits:' as status;
SELECT 
    subscription_tier,
    daily_question_limit,
    COUNT(*) as user_count
FROM profiles 
GROUP BY subscription_tier, daily_question_limit
ORDER BY subscription_tier, daily_question_limit;

-- Step 2: Update existing free users from 30 to 15 questions per day
UPDATE public.profiles 
SET daily_question_limit = 15, updated_at = NOW()
WHERE subscription_tier = 'free' AND daily_question_limit = 30;

-- Step 3: Update the default value for new users
ALTER TABLE public.profiles 
ALTER COLUMN daily_question_limit SET DEFAULT 15;

-- Step 4: Update the check_daily_usage function
CREATE OR REPLACE FUNCTION public.check_daily_usage(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    daily_limit INTEGER;
BEGIN
    -- Get user's daily limit
    SELECT daily_question_limit INTO daily_limit
    FROM public.profiles
    WHERE id = user_id;

    -- Get or create today's usage log
    INSERT INTO public.usage_logs (user_id, questions_generated)
    VALUES (user_id, 0)
    ON CONFLICT (user_id, date) DO NOTHING;

    -- Get current usage
    SELECT questions_generated INTO current_usage
    FROM public.usage_logs
    WHERE user_id = user_id AND date = CURRENT_DATE;

    -- Check if user has exceeded their limit
    RETURN current_usage < daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Verify the changes
SELECT 'AFTER UPDATE - New daily limits:' as status;
SELECT 
    subscription_tier,
    daily_question_limit,
    COUNT(*) as user_count
FROM profiles 
GROUP BY subscription_tier, daily_question_limit
ORDER BY subscription_tier, daily_question_limit;

-- Step 6: Check the new default value
SELECT 
    column_name,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
    AND column_name = 'daily_question_limit';

-- Success message
SELECT 'SUCCESS: Daily limit updated from 30 to 15 questions for free users!' as result; 