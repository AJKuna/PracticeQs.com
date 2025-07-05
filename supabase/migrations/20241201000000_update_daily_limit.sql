-- Update daily question limit from 30 to 15 for free users
-- This migration updates existing free users and changes the default for new users

-- Update existing free users from 30 to 15 questions per day
UPDATE public.profiles 
SET daily_question_limit = 15, updated_at = NOW()
WHERE subscription_tier = 'free' AND daily_question_limit = 30;

-- Update the default value for new users
ALTER TABLE public.profiles 
ALTER COLUMN daily_question_limit SET DEFAULT 15;

-- Update the check_daily_usage function to handle the new default
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