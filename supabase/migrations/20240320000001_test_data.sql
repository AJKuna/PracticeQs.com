-- Clean up any existing test data
delete from auth.users where email in (
    'test@example.com',
    'subscription_test@example.com',
    'usage_test@example.com',
    'profile_test@example.com',
    'user1@example.com',
    'user2@example.com'
);

-- Test 1: Create a test user and verify profile creation
do $$
declare
    test_user_id uuid;
begin
    -- Create a test user
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    values (
        gen_random_uuid(),
        'test@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now()
    ) returning id into test_user_id;

    -- Verify profile was created automatically
    assert exists(
        select 1 from profiles where id = test_user_id
    ), 'Profile was not created automatically';

    -- Verify profile has correct default values
    assert exists(
        select 1 from profiles 
        where id = test_user_id 
        and subscription_tier = 'free'::subscription_tier
        and subscription_status = 'inactive'::subscription_status
    ), 'Profile does not have correct default values';

    -- Clean up
    delete from auth.users where id = test_user_id;
    
    raise notice 'Test 1 PASSED: Profile creation and defaults';
end $$;

-- Test 2: Test subscription management
do $$
declare
    test_user_id uuid;
    subscription_id uuid;
begin
    -- Create a test user
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    values (
        gen_random_uuid(),
        'subscription_test@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now()
    ) returning id into test_user_id;

    -- Create an active subscription
    insert into subscriptions (
        user_id,
        tier,
        status,
        start_date,
        end_date
    ) values (
        test_user_id,
        'premium'::subscription_tier,
        'active'::subscription_status,
        now(),
        now() + interval '1 month'
    ) returning id into subscription_id;

    -- Verify subscription was created
    assert exists(
        select 1 from subscriptions where id = subscription_id
    ), 'Subscription was not created';

    -- Try to create another active subscription (should fail)
    begin
        insert into subscriptions (
            user_id,
            tier,
            status,
            start_date,
            end_date
        ) values (
            test_user_id,
            'basic'::subscription_tier,
            'active'::subscription_status,
            now(),
            now() + interval '1 month'
        );
        assert false, 'Should not be able to create multiple active subscriptions';
    exception
        when unique_violation then
            -- This is expected
            raise notice 'Test 2 PASSED: Unique constraint working correctly';
    end;

    -- Clean up
    delete from auth.users where id = test_user_id;
end $$;

-- Test 3: Test usage logging
do $$
declare
    test_user_id uuid;
    usage_log_id uuid;
begin
    -- Create a test user
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    values (
        gen_random_uuid(),
        'usage_test@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now()
    ) returning id into test_user_id;

    -- Create a usage log
    insert into usage_logs (
        user_id,
        action,
        details
    ) values (
        test_user_id,
        'test_action',
        '{"test": "data"}'::jsonb
    ) returning id into usage_log_id;

    -- Verify usage log was created
    assert exists(
        select 1 from usage_logs where id = usage_log_id
    ), 'Usage log was not created';

    -- Verify usage log has correct data
    assert exists(
        select 1 from usage_logs 
        where id = usage_log_id 
        and action = 'test_action'
        and details->>'test' = 'data'
    ), 'Usage log does not have correct data';

    -- Clean up
    delete from auth.users where id = test_user_id;
    
    raise notice 'Test 3 PASSED: Usage logging working correctly';
end $$;

-- Test 4: Test profile updates
do $$
declare
    test_user_id uuid;
begin
    -- Create a test user
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    values (
        gen_random_uuid(),
        'profile_test@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now()
    ) returning id into test_user_id;

    -- Update profile
    update profiles
    set 
        full_name = 'Test User',
        avatar_url = 'https://example.com/avatar.jpg',
        subscription_tier = 'basic'::subscription_tier,
        subscription_status = 'active'::subscription_status,
        subscription_start_date = now(),
        subscription_end_date = now() + interval '1 month'
    where id = test_user_id;

    -- Verify profile was updated
    assert exists(
        select 1 from profiles 
        where id = test_user_id 
        and full_name = 'Test User'
        and avatar_url = 'https://example.com/avatar.jpg'
        and subscription_tier = 'basic'::subscription_tier
        and subscription_status = 'active'::subscription_status
    ), 'Profile was not updated correctly';

    -- Clean up
    delete from auth.users where id = test_user_id;
    
    raise notice 'Test 4 PASSED: Profile updates working correctly';
end $$;

-- Test 5: Test basic table structure and relationships
do $$
declare
    test_user_id uuid;
    profile_count int;
    subscription_count int;
    usage_count int;
begin
    -- Create a test user
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    values (
        gen_random_uuid(),
        'structure_test@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now()
    ) returning id into test_user_id;

    -- Check that profile was created
    select count(*) into profile_count from profiles where id = test_user_id;
    assert profile_count = 1, 'Profile count should be 1';

    -- Create subscription and usage log
    insert into subscriptions (user_id, tier, status, start_date, end_date)
    values (test_user_id, 'free'::subscription_tier, 'active'::subscription_status, now(), now() + interval '1 month');

    insert into usage_logs (user_id, action, details)
    values (test_user_id, 'test_action', '{"key": "value"}'::jsonb);

    -- Check counts
    select count(*) into subscription_count from subscriptions where user_id = test_user_id;
    select count(*) into usage_count from usage_logs where user_id = test_user_id;

    assert subscription_count = 1, 'Subscription count should be 1';
    assert usage_count = 1, 'Usage log count should be 1';

    -- Test cascade delete
    delete from auth.users where id = test_user_id;

    -- Verify cascade delete worked
    select count(*) into profile_count from profiles where id = test_user_id;
    select count(*) into subscription_count from subscriptions where user_id = test_user_id;
    select count(*) into usage_count from usage_logs where user_id = test_user_id;

    assert profile_count = 0, 'Profile should be deleted';
    assert subscription_count = 0, 'Subscription should be deleted';
    assert usage_count = 0, 'Usage log should be deleted';

    raise notice 'Test 5 PASSED: Table structure and cascade deletes working correctly';
end $$;

-- Summary
do $$
begin
    raise notice '=== ALL TESTS COMPLETED SUCCESSFULLY ===';
    raise notice 'Database schema is working correctly!';
    raise notice '1. Profile creation and defaults ✓';
    raise notice '2. Subscription unique constraints ✓';
    raise notice '3. Usage logging ✓';
    raise notice '4. Profile updates ✓';
    raise notice '5. Table relationships and cascade deletes ✓';
end $$; 