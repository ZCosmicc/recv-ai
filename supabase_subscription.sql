-- Add pro_expires_at column for subscription tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ;

-- Backfill existing Pro users with 30-day expiry from now
UPDATE profiles 
SET pro_expires_at = NOW() + INTERVAL '30 days'
WHERE tier = 'pro' AND pro_expires_at IS NULL;

-- Add index for efficient expiry queries
CREATE INDEX IF NOT EXISTS idx_profiles_pro_expires_at 
ON profiles(pro_expires_at) 
WHERE pro_expires_at IS NOT NULL;
