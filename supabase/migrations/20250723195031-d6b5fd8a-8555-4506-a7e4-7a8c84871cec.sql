-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'deleted');

-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN status public.user_status NOT NULL DEFAULT 'active';

-- Create function to update user status (soft deletion/status management)
CREATE OR REPLACE FUNCTION public.update_user_status(target_user_id uuid, new_status user_status)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Super admin role required.';
  END IF;

  -- Prevent users from updating their own status
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Cannot update your own status.';
  END IF;

  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- Update user status
  UPDATE public.profiles 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Return success result
  result := json_build_object(
    'success', true,
    'message', 'User status updated successfully.',
    'user_id', target_user_id,
    'new_status', new_status
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