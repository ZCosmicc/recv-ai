-- 1. Add 'role' column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    model TEXT DEFAULT 'llama-3.3-70b',
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on usage_logs
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own logs (via API)
CREATE POLICY "Users can insert their own logs" 
ON usage_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all logs (we will handle admin check in API, but RLS is good practice)
-- For now, allow public read if needed for stats, or strict admin only. 
-- Let's keep it simple: Service Role (API) will read it.

-- 3. Bootstrap Admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'farizfadillah612@gmail.com';
