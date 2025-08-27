-- Fix email population issue for new users
-- This migration ensures the email column exists and the trigger properly populates it

-- First, add email column if it doesn't exist (for backward compatibility)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Make email unique and not null if it wasn't already
-- Note: This will be done after populating existing null emails
DO $$
BEGIN
    -- Check if email column exists but isn't marked as NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email' 
        AND is_nullable = 'YES'
    ) THEN
        -- First populate any existing null emails from auth.users
        UPDATE public.profiles 
        SET email = auth_users.email
        FROM auth.users AS auth_users
        WHERE profiles.id = auth_users.id 
        AND profiles.email IS NULL;
        
        -- Now make the column NOT NULL
        ALTER TABLE public.profiles 
        ALTER COLUMN email SET NOT NULL;
        
        -- Add unique constraint only if it doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'profiles' 
            AND constraint_name = 'profiles_email_unique'
        ) THEN
            ALTER TABLE public.profiles 
            ADD CONSTRAINT profiles_email_unique UNIQUE (email);
        END IF;
    END IF;
END $$;

-- Update the trigger function to properly populate email and handle last_splash_shown
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, last_splash_shown)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        NULL  -- Set to NULL initially so splash screen shows for new users
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile record when a new user signs up, populating email from auth.users';
