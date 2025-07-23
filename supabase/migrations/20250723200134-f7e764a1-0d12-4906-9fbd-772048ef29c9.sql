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

-- Update the update_user_status function to handle session revocation
CREATE OR REPLACE FUNCTION public.update_user_status(target_user_id uuid, new_status user_status)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  result JSON;
  old_status user_status;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Super admin role required.';
  END IF;

  -- Prevent users from updating their own status
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Cannot update your own status.';
  END IF;

  -- Check if target user exists and get current status
  SELECT status INTO old_status
  FROM public.profiles 
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- Update user status
  UPDATE public.profiles 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = target_user_id;

  -- If status changed from active to inactive/deleted, revoke sessions
  IF old_status = 'active' AND (new_status = 'inactive' OR new_status = 'deleted') THEN
    PERFORM public.revoke_user_sessions(target_user_id);
  END IF;

  -- Return success result
  result := json_build_object(
    'success', true,
    'message', 'User status updated successfully.',
    'user_id', target_user_id,
    'new_status', new_status,
    'sessions_revoked', (old_status = 'active' AND (new_status = 'inactive' OR new_status = 'deleted'))
  );

  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', target_user_id
    );
    RETURN result;
END;
$function$;