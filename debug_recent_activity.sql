-- Debug Recent Activity - Check UUIDs for recent question generation
-- This will show the most recent usage logs and streak records to identify the UUID mismatch

-- 1. Show the most recent usage_logs entries
SELECT 
    'RECENT USAGE LOGS' as table_name,
    user_id,
    date,
    questions_generated,
    last_generated_at
FROM public.usage_logs 
ORDER BY last_generated_at DESC 
LIMIT 5;

-- 2. Show all streak records
SELECT 
    'STREAK RECORDS' as table_name,
    user_id,
    current_streak,
    longest_streak,
    last_active,
    created_at,
    updated_at
FROM public.streaks 
ORDER BY updated_at DESC;

-- 3. Check if your specific user has both records
-- Replace with your actual user ID if you know it, or this will show all recent activity
WITH recent_users AS (
    SELECT DISTINCT user_id 
    FROM public.usage_logs 
    WHERE last_generated_at >= CURRENT_DATE
)
SELECT 
    ru.user_id as recent_user_id,
    ul.date as usage_date,
    ul.questions_generated,
    ul.last_generated_at,
    s.user_id as streak_user_id,
    s.current_streak,
    s.last_active,
    CASE 
        WHEN ru.user_id = s.user_id THEN '✓ MATCH' 
        WHEN s.user_id IS NULL THEN '⚠️ NO STREAK RECORD'
        ELSE '✗ UUID MISMATCH' 
    END as uuid_status
FROM recent_users ru
LEFT JOIN public.usage_logs ul ON ru.user_id = ul.user_id AND ul.date = CURRENT_DATE
LEFT JOIN public.streaks s ON ru.user_id = s.user_id
ORDER BY ul.last_generated_at DESC;

-- 4. Check if the trigger function exists and is working
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'usage_logs' 
AND trigger_schema = 'public';
