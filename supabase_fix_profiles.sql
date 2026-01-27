-- Create a trigger function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, tier, role, daily_credits_used, last_credit_reset, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    'user',
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also backfill any existing users who don't have profiles
INSERT INTO public.profiles (id, email, tier, role, daily_credits_used, last_credit_reset, created_at)
SELECT 
  id,
  email,
  'free' as tier,
  'user' as role,
  0 as daily_credits_used,
  NOW() as last_credit_reset,
  created_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);
