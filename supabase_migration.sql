-- Add columns to track daily AI credit usage
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_credit_reset TIMESTAMPTZ DEFAULT NOW();

-- Optional: Create a cron job or logic to reset credits? 
-- Note for Developer: We are handling the reset logic in the API route (lazy reset on next request). 
-- This is simpler than setting up pg_cron triggers for 1000 users.
