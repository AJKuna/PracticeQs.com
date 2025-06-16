-- Verification Queries for Database Setup
-- Run these queries to confirm your database is set up correctly

-- 1. Check if all tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'usage_logs', 'subscriptions')
ORDER BY table_name;

-- 2. Check if custom types exist
SELECT 
    typname as type_name,
    typtype as type_type
FROM pg_type 
WHERE typname IN ('subscription_tier', 'subscription_status');

-- 3. Check if indexes exist
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('profiles', 'usage_logs', 'subscriptions')
    AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'usage_logs', 'subscriptions')
    AND schemaname = 'public';

-- 5. Check if policies exist
SELECT 
    tablename,
    policyname,
    cmd as command,
    roles
FROM pg_policies 
WHERE tablename IN ('profiles', 'usage_logs', 'subscriptions')
ORDER BY tablename, policyname;

-- 6. Check if functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('handle_new_user', 'handle_updated_at');

-- 7. Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND event_object_table IN ('profiles')
ORDER BY event_object_table, trigger_name;

-- 8. Test a simple profile creation (will be cleaned up)
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    profile_exists boolean;
BEGIN
    -- Insert test user
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
        test_user_id,
        'verification_test@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now()
    );
    
    -- Check if profile was created
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = test_user_id) INTO profile_exists;
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_user_id;
    
    -- Report result
    IF profile_exists THEN
        RAISE NOTICE '✅ Profile auto-creation is working correctly';
    ELSE
        RAISE NOTICE '❌ Profile auto-creation is NOT working';
    END IF;
END $$; 