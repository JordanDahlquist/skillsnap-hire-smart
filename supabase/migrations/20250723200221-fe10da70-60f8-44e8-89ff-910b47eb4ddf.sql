-- Create function to revoke user sessions when status changes
CREATE OR REPLACE FUNCTION public.revoke_user_sessions(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- This function will be used to trigger session revocation
  -- The actual session revocation will be handled by the application layer
  -- We'll insert a record to track when sessions should be revoked
  INSERT INTO public.session_revocations (user_id, revoked_at)
  VALUES (target_user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    revoked_at = NOW();
END;
$function$;

-- Create table to track session revocations
CREATE TABLE IF NOT EXISTS public.session_revocations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  revoked_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on session_revocations table
ALTER TABLE public.session_revocations ENABLE ROW LEVEL SECURITY;

-- Create policy for session revocations
CREATE POLICY "Users can view their own session revocations"
ON public.session_revocations
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger function for profile status changes
CREATE OR REPLACE FUNCTION public.handle_profile_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Check if status changed to inactive or deleted
  IF OLD.status = 'active' AND (NEW.status = 'inactive' OR NEW.status = 'deleted') THEN
    -- Revoke sessions for this user
    PERFORM public.revoke_user_sessions(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on profiles table for status changes
CREATE TRIGGER profile_status_change_trigger
  AFTER UPDATE OF status ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_status_change();