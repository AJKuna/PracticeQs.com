-- Add last_splash_shown column to profiles table
-- This tracks when a user last saw the splash screen to ensure it only shows once per day

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_splash_shown DATE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.last_splash_shown IS 'Date when user last saw the splash screen (YYYY-MM-DD format)';
