# Database Migrations

## Topic Progress Table Migration

### Overview
This migration creates the `topic_progress` table to store progress tracking data for premium users. This allows progress to persist across sessions, sign-outs, and devices.

### What's Included
- **Table**: `topic_progress` - stores user progress data for each subject
- **Columns**:
  - `id`: Unique identifier (UUID)
  - `user_id`: Reference to the user (foreign key to auth.users)
  - `subject`: The subject name (e.g., 'physics', 'mathematics')
  - `progress_data`: JSON object mapping topic names to questions completed (0-25)
  - `created_at`: Timestamp when record was created
  - `updated_at`: Timestamp when record was last updated
- **Indexes**: Optimized for lookups by user_id and user_id+subject
- **RLS Policies**: Row-level security ensuring users can only access their own data

### Running the Migration

#### Option 1: Automated (if available)
```bash
cd Backend
node runMigration.js
```

#### Option 2: Manual (Recommended for Supabase)
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `create_topic_progress_table.sql`
4. Paste and run in the SQL Editor
5. Verify the table was created successfully

### Verification
After running the migration, verify it worked by:
1. Checking the Tables section in Supabase Dashboard
2. Looking for the `topic_progress` table
3. Verifying the RLS policies are enabled

### Rollback (if needed)
To remove the table:
```sql
DROP TABLE IF EXISTS topic_progress CASCADE;
```

### Notes
- This feature is only available for premium users
- Progress is automatically synced from the frontend
- LocalStorage is used as a fallback/cache
- The table uses JSONB for flexible storage of progress data
