-- Investigate UUID Mismatch
-- Check what's happening with the specific UUIDs you mentioned

-- 1. Check your recent usage log entry
SELECT 
    'YOUR USAGE LOG' as source,
    user_id,
    date,
    questions_generated,
    last_generated_at,
    -- Check if this user exists in profiles
    (SELECT full_name FROM public.profiles WHERE id = user_id) as profile_name
FROM public.usage_logs 
WHERE user_id = 'ba753ccd-63e5-4464-ba16-d76cb82c7011'
ORDER BY last_generated_at DESC
LIMIT 1;

-- 2. Check the streak record that was created
SELECT 
    'STREAK RECORD' as source,
    user_id,
    current_streak,
    longest_streak,
    last_active,
    created_at,
    updated_at,
    -- Check if this user exists in profiles
    (SELECT full_name FROM public.profiles WHERE id = user_id) as profile_name
FROM public.streaks 
WHERE user_id = 'b9e9578c-9374-4f43-bd7c-cef7a818f7bc';

-- 3. Check if there are any other recent usage logs that might have triggered the streak
SELECT 
    'OTHER RECENT LOGS' as source,
    user_id,
    date,
    questions_generated,
    last_generated_at,
    (SELECT full_name FROM public.profiles WHERE id = user_id) as profile_name
FROM public.usage_logs 
WHERE last_generated_at >= NOW() - INTERVAL '1 hour'
ORDER BY last_generated_at DESC;

-- 4. Check if there are multiple users generating questions recently
SELECT 
    'RECENT ACTIVITY COUNT' as source,
    COUNT(DISTINCT user_id) as unique_users_last_hour,
    COUNT(*) as total_logs_last_hour
FROM public.usage_logs 
WHERE last_generated_at >= NOW() - INTERVAL '1 hour';

-- 5. Check both profiles to see who these UUIDs belong to
SELECT 
    'PROFILE CHECK' as source,
    id as user_id,
    full_name,
    email,
    created_at
FROM public.profiles 
WHERE id IN ('ba753ccd-63e5-4464-ba16-d76cb82c7011', 'b9e9578c-9374-4f43-bd7c-cef7a818f7bc')
ORDER BY id;
