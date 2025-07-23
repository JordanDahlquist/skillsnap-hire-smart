-- Update the profile status change trigger to handle reactivation
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
  
  -- Check if status changed back to active (reactivation)
  IF (OLD.status = 'inactive' OR OLD.status = 'deleted') AND NEW.status = 'active' THEN
    -- Remove session revocation record to allow user to login
    DELETE FROM public.session_revocations WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;