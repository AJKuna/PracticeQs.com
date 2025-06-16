-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_sign_in TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
    subscription_status subscription_status DEFAULT 'active' NOT NULL,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    daily_question_limit INTEGER DEFAULT 30 NOT NULL,
    CONSTRAINT valid_subscription_dates CHECK (
        (subscription_start_date IS NULL AND subscription_end_date IS NULL) OR
        (subscription_start_date IS NOT NULL AND subscription_end_date IS NOT NULL AND subscription_end_date > subscription_start_date)
    )
);

-- Create usage_logs table
CREATE TABLE public.usage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    questions_generated INTEGER DEFAULT 0 NOT NULL,
    last_generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create subscription_history table
CREATE TABLE public.subscription_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    previous_tier subscription_tier,
    new_tier subscription_tier NOT NULL,
    previous_status subscription_status,
    new_status subscription_status NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    reason TEXT
);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Usage logs policies
CREATE POLICY "Users can view their own usage logs"
    ON public.usage_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs"
    ON public.usage_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update usage logs"
    ON public.usage_logs FOR UPDATE
    USING (true);

-- Subscription history policies
CREATE POLICY "Users can view their own subscription history"
    ON public.subscription_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscription history"
    ON public.subscription_history FOR INSERT
    WITH CHECK (true);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check and update daily usage
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

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.usage_logs
    SET 
        questions_generated = questions_generated + 1,
        last_generated_at = NOW()
    WHERE user_id = user_id AND date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_usage_logs_user_date ON public.usage_logs(user_id, date);
CREATE INDEX idx_subscription_history_user ON public.subscription_history(user_id); 