-- Add indexes for better performance on daily briefings
CREATE INDEX IF NOT EXISTS idx_daily_briefings_user_created 
ON daily_briefings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_briefings_expires_at 
ON daily_briefings(expires_at);

-- Add index for profile regeneration tracking
CREATE INDEX IF NOT EXISTS idx_profiles_regeneration_date 
ON profiles(last_regeneration_date);

-- Add a function to automatically clean up old briefings
CREATE OR REPLACE FUNCTION cleanup_old_briefings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete briefings older than 7 days
  DELETE FROM public.daily_briefings 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;