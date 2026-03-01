-- Create topic_progress table to store user progress for premium users
-- This table stores the progress tracking data (questions completed per topic)

CREATE TABLE IF NOT EXISTS topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_subject ON topic_progress(user_id, subject);

-- Add RLS (Row Level Security) policies
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

-- Users can only read their own progress
CREATE POLICY "Users can view own progress" ON topic_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own progress
CREATE POLICY "Users can insert own progress" ON topic_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own progress
CREATE POLICY "Users can update own progress" ON topic_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own progress
CREATE POLICY "Users can delete own progress" ON topic_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment explaining the table
COMMENT ON TABLE topic_progress IS 'Stores topic progress tracking for premium users. Each row contains progress data (questions completed out of 25) for all topics in a subject.';
COMMENT ON COLUMN topic_progress.progress_data IS 'JSON object mapping topic names to number of questions completed (0-25)';
