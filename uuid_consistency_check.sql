-- UUID Consistency Check Query
-- This query joins all user-related tables to identify UUID mismatches

WITH user_data AS (
    -- Get all unique user IDs from each table
    SELECT 
        au.id as auth_user_id,
        au.email,
        p.id as profile_id,
        p.full_name,
        ul.user_id as usage_log_user_id,
        ul.date as latest_usage_date,
        ul.questions_generated,
        s.user_id as streak_user_id,
        s.current_streak,
        s.longest_streak,
        s.last_active as streak_last_active
    FROM auth.users au
    FULL OUTER JOIN public.profiles p ON au.id = p.id
    FULL OUTER JOIN (
        -- Get latest usage log entry for each user
        SELECT DISTINCT ON (user_id) 
            user_id, date, questions_generated 
        FROM public.usage_logs 
        ORDER BY user_id, date DESC
    ) ul ON COALESCE(au.id, p.id) = ul.user_id
    FULL OUTER JOIN public.streaks s ON COALESCE(au.id, p.id, ul.user_id) = s.user_id
)

SELECT 
    -- User identification
    COALESCE(auth_user_id, profile_id, usage_log_user_id, streak_user_id) as main_user_id,
    email,
    full_name,
    
    -- UUID consistency checks
    CASE 
        WHEN auth_user_id = profile_id OR (auth_user_id IS NULL OR profile_id IS NULL) THEN '✓'
        ELSE '✗ MISMATCH'
    END as auth_profile_match,
    
    CASE 
        WHEN COALESCE(auth_user_id, profile_id) = usage_log_user_id OR usage_log_user_id IS NULL THEN '✓'
        ELSE '✗ MISMATCH'
    END as profile_usage_match,
    
    CASE 
        WHEN COALESCE(auth_user_id, profile_id) = streak_user_id OR streak_user_id IS NULL THEN '✓'
        ELSE '✗ MISMATCH'
    END as profile_streak_match,
    
    -- Data presence indicators
    CASE WHEN auth_user_id IS NOT NULL THEN '✓' ELSE '✗' END as has_auth_user,
    CASE WHEN profile_id IS NOT NULL THEN '✓' ELSE '✗' END as has_profile,
    CASE WHEN usage_log_user_id IS NOT NULL THEN '✓' ELSE '✗' END as has_usage_logs,
    CASE WHEN streak_user_id IS NOT NULL THEN '✓' ELSE '✗' END as has_streaks,
    
    -- Actual data
    latest_usage_date,
    questions_generated,
    current_streak,
    longest_streak,
    streak_last_active,
    
    -- Raw UUIDs for debugging
    auth_user_id,
    profile_id,
    usage_log_user_id,
    streak_user_id

FROM user_data
ORDER BY 
    -- Show mismatches first
    CASE WHEN 
        (auth_user_id != profile_id AND auth_user_id IS NOT NULL AND profile_id IS NOT NULL) OR
        (COALESCE(auth_user_id, profile_id) != usage_log_user_id AND usage_log_user_id IS NOT NULL) OR
        (COALESCE(auth_user_id, profile_id) != streak_user_id AND streak_user_id IS NOT NULL)
    THEN 0 ELSE 1 END,
    email;

-- Additional summary query to show overall consistency
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN auth_user_id = profile_id OR (auth_user_id IS NULL OR profile_id IS NULL) THEN 1 END) as auth_profile_consistent,
    COUNT(CASE WHEN COALESCE(auth_user_id, profile_id) = usage_log_user_id OR usage_log_user_id IS NULL THEN 1 END) as profile_usage_consistent,
    COUNT(CASE WHEN COALESCE(auth_user_id, profile_id) = streak_user_id OR streak_user_id IS NULL THEN 1 END) as profile_streak_consistent,
    COUNT(CASE WHEN usage_log_user_id IS NOT NULL THEN 1 END) as users_with_usage_logs,
    COUNT(CASE WHEN streak_user_id IS NOT NULL THEN 1 END) as users_with_streaks
FROM (
    SELECT 
        au.id as auth_user_id,
        p.id as profile_id,
        ul.user_id as usage_log_user_id,
        s.user_id as streak_user_id
    FROM auth.users au
    FULL OUTER JOIN public.profiles p ON au.id = p.id
    FULL OUTER JOIN (SELECT DISTINCT user_id FROM public.usage_logs) ul ON COALESCE(au.id, p.id) = ul.user_id
    FULL OUTER JOIN public.streaks s ON COALESCE(au.id, p.id, ul.user_id) = s.user_id
) summary;
