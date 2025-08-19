-- Comprehensive Security and RLS Policy Audit
-- This query checks all security settings without making any changes

-- 1. Check RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✓ RLS Enabled'
        ELSE '⚠️ RLS DISABLED'
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check all RLS policies for public tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check table ownership and permissions
SELECT 
    t.table_schema,
    t.table_name,
    t.table_type,
    tp.grantee,
    tp.privilege_type,
    tp.is_grantable
FROM information_schema.tables t
LEFT JOIN information_schema.table_privileges tp ON t.table_name = tp.table_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, tp.privilege_type;

-- 4. Check function security and ownership
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE p.prosecdef 
        WHEN true THEN '✓ SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    r.rolname as owner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_roles r ON p.proowner = r.oid
WHERE n.nspname = 'public'
AND p.proname IN ('update_streak', 'handle_usage_log_insert', 'handle_new_user')
ORDER BY p.proname;

-- 5. Check triggers and their security
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.action_timing,
    t.event_manipulation,
    t.action_statement,
    t.action_orientation
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;

-- 6. Verify specific security policies for each table
-- Profiles table policies
SELECT 'PROFILES POLICIES' as check_type, * FROM pg_policies WHERE tablename = 'profiles';

-- Usage logs policies  
SELECT 'USAGE_LOGS POLICIES' as check_type, * FROM pg_policies WHERE tablename = 'usage_logs';

-- Streaks policies
SELECT 'STREAKS POLICIES' as check_type, * FROM pg_policies WHERE tablename = 'streaks';

-- 7. Check for any security vulnerabilities
SELECT 
    'SECURITY SUMMARY' as check_type,
    COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_with_rls,
    COUNT(*) as total_public_tables,
    CASE 
        WHEN COUNT(CASE WHEN rowsecurity THEN 1 END) = COUNT(*) THEN '✓ ALL TABLES SECURE'
        ELSE '⚠️ SOME TABLES MISSING RLS'
    END as overall_security_status
FROM pg_tables 
WHERE schemaname = 'public';

-- 8. Check auth.uid() function is accessible (critical for RLS)
SELECT 
    'AUTH FUNCTION CHECK' as check_type,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✓ Auth context available'
        WHEN auth.uid() IS NULL THEN '⚠️ No auth context (normal in SQL editor)'
        ELSE '✗ Auth function error'
    END as auth_status;
