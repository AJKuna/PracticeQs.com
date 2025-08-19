-- Migration: Add Streak Tracking
-- Description: Creates a streaks table and automatic streak tracking functionality
-- Date: 2025-01-16

-- Create streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_active DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to update streak data
CREATE OR REPLACE FUNCTION public.update_streak(input_user_id UUID)
RETURNS void AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    last_active_date DATE;
    current_streak_count INTEGER;
    longest_streak_count INTEGER;
    days_diff INTEGER;
BEGIN
    -- Get current streak data for the user
    SELECT last_active, current_streak, longest_streak 
    INTO last_active_date, current_streak_count, longest_streak_count
    FROM public.streaks 
    WHERE user_id = input_user_id;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_active, updated_at)
        VALUES (input_user_id, 1, 1, current_date, NOW());
        RETURN;
    END IF;
    
    -- If last_active is today, do nothing
    IF last_active_date = current_date THEN
        RETURN;
    END IF;
    
    -- Calculate days difference
    IF last_active_date IS NULL THEN
        days_diff = 999; -- Force reset for null case
    ELSE
        days_diff = current_date - last_active_date;
    END IF;
    
    -- Update streak based on days difference
    IF days_diff = 1 THEN
        -- Consecutive day: increment current streak
        current_streak_count := current_streak_count + 1;
    ELSE
        -- Gap in activity: reset current streak to 1
        current_streak_count := 1;
    END IF;
    
    -- Update longest streak if current exceeds it
    IF current_streak_count > longest_streak_count THEN
        longest_streak_count := current_streak_count;
    END IF;
    
    -- Update the record
    UPDATE public.streaks 
    SET 
        current_streak = current_streak_count,
        longest_streak = longest_streak_count,
        last_active = current_date,
        updated_at = NOW()
    WHERE user_id = input_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function that calls update_streak
CREATE OR REPLACE FUNCTION public.handle_usage_log_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the update_streak function with the user_id from the new usage log
    PERFORM public.update_streak(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on usage_logs table (drop if exists to make idempotent)
DROP TRIGGER IF EXISTS trigger_update_streak ON public.usage_logs;
CREATE TRIGGER trigger_update_streak
    AFTER INSERT ON public.usage_logs
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_usage_log_insert();

-- Enable Row Level Security
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for streaks table
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.streaks;
CREATE POLICY "Users can view their own streaks"
    ON public.streaks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert streaks" ON public.streaks;
CREATE POLICY "System can insert streaks"
    ON public.streaks FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "System can update streaks" ON public.streaks;
CREATE POLICY "System can update streaks"
    ON public.streaks FOR UPDATE
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_last_active ON public.streaks(last_active);

-- Add comments for documentation
COMMENT ON TABLE public.streaks IS 'Tracks user streaks for daily question generation activity';
COMMENT ON COLUMN public.streaks.user_id IS 'References the user from profiles table';
COMMENT ON COLUMN public.streaks.current_streak IS 'Number of consecutive days user has generated questions';
COMMENT ON COLUMN public.streaks.longest_streak IS 'Maximum consecutive days achieved by the user';
COMMENT ON COLUMN public.streaks.last_active IS 'Last date user generated questions';
COMMENT ON FUNCTION public.update_streak(UUID) IS 'Updates streak data when user generates questions';
