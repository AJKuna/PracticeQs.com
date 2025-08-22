-- RLS Policy Update: Restrict User Profile Updates
-- This script removes the overly permissive profile update policy 
-- and replaces it with a restrictive one that only allows users 
-- to update safe, non-critical fields.

-- 1. Drop the existing overly permissive update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Create a new restrictive policy that only allows updates to safe fields
-- Users can ONLY update: full_name, avatar_url, last_splash_shown
-- Users CANNOT update: subscription_tier, subscription_status, daily_question_limit, 
-- subscription_start_date, subscription_end_date, email, id, created_at, updated_at
CREATE POLICY "Users can update safe profile fields only"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        -- Ensure subscription-related fields cannot be changed by users
        subscription_tier = (SELECT subscription_tier FROM public.profiles WHERE id = auth.uid()) AND
        subscription_status = (SELECT subscription_status FROM public.profiles WHERE id = auth.uid()) AND
        daily_question_limit = (SELECT daily_question_limit FROM public.profiles WHERE id = auth.uid()) AND
        subscription_start_date IS NOT DISTINCT FROM (SELECT subscription_start_date FROM public.profiles WHERE id = auth.uid()) AND
        subscription_end_date IS NOT DISTINCT FROM (SELECT subscription_end_date FROM public.profiles WHERE id = auth.uid()) AND
        email = (SELECT email FROM public.profiles WHERE id = auth.uid()) AND
        id = (SELECT id FROM public.profiles WHERE id = auth.uid()) AND
        created_at = (SELECT created_at FROM public.profiles WHERE id = auth.uid())
        -- Note: updated_at, full_name, avatar_url, last_splash_shown can be changed
    );

-- 3. Verify the policy was created successfully
SELECT 
    policyname,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname = 'Users can update safe profile fields only';

-- 4. Test the policy (optional - you can run this to verify it works)
-- This query should succeed (updating allowed field)
-- UPDATE public.profiles SET full_name = 'Test Name' WHERE id = auth.uid();

-- This query should fail (updating restricted field)  
-- UPDATE public.profiles SET daily_question_limit = 999 WHERE id = auth.uid();
