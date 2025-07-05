-- Verification Query for Daily Limit Update (30 -> 15 questions)
-- Run this query to check if the daily limit migration has been applied

SELECT 'CHECKING DAILY LIMIT UPDATE STATUS...' as status;

-- 1. Check current default value for daily_question_limit
SELECT 
    'Default value check:' as check_type,
    column_default as current_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
    AND column_name = 'daily_question_limit';

-- 2. Check current daily_question_limit values for all users
SELECT 
    'User limit distribution:' as check_type,
    subscription_tier,
    daily_question_limit,
    COUNT(*) as user_count
FROM profiles 
GROUP BY subscription_tier, daily_question_limit
ORDER BY subscription_tier, daily_question_limit;

-- 3. Check if any users still have the old limit of 30
SELECT 
    'Users with old limit (30):' as check_type,
    COUNT(*) as users_with_30_limit
FROM profiles 
WHERE daily_question_limit = 30;

-- 4. Check if any users have the new limit of 15
SELECT 
    'Users with new limit (15):' as check_type,
    COUNT(*) as users_with_15_limit
FROM profiles 
WHERE daily_question_limit = 15;

-- Expected Results After Migration:
-- - Default value should be 15 (not 30)
-- - Free users should have daily_question_limit = 15
-- - Premium users should have daily_question_limit = null (unlimited)
-- - No users should have daily_question_limit = 30

SELECT 'VERIFICATION COMPLETE' as status; 