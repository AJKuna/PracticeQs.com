-- Add user_status column to usage_logs table
-- This tracks whether a user is "new" (first time generating questions) or "returning"

ALTER TABLE public.usage_logs 
ADD COLUMN user_status TEXT CHECK (user_status IN ('new', 'returning'));

-- Add index for better performance when filtering by user_status
CREATE INDEX idx_usage_logs_user_status ON public.usage_logs(user_status);

-- Add comment to describe the column
COMMENT ON COLUMN public.usage_logs.user_status IS 'Tracks if user is "new" (first time generating questions) or "returning" (has generated before)'; 