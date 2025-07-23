-- Create function to delete a user completely
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  deletion_count INTEGER := 0;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Super admin role required.';
  END IF;

  -- Prevent users from deleting themselves
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;

  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- Delete user data in correct order (tables that reference the user first)
  
  -- Delete email logs
  DELETE FROM public.email_logs WHERE user_id = target_user_id;
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  
  -- Delete email threads 
  DELETE FROM public.email_threads WHERE user_id = target_user_id;
  
  -- Delete email messages (will be deleted by cascade from threads)
  -- No need to explicitly delete as they cascade from threads
  
  -- Delete email templates
  DELETE FROM public.email_templates WHERE user_id = target_user_id;
  
  -- Delete scout conversations
  DELETE FROM public.scout_conversations WHERE user_id = target_user_id;
  
  -- Delete daily briefings
  DELETE FROM public.daily_briefings WHERE user_id = target_user_id;
  
  -- Delete applications for user's jobs
  DELETE FROM public.applications WHERE job_id IN (
    SELECT id FROM public.jobs WHERE user_id = target_user_id
  );
  
  -- Delete hiring stages for user's jobs
  DELETE FROM public.hiring_stages WHERE job_id IN (
    SELECT id FROM public.jobs WHERE user_id = target_user_id
  );
  
  -- Delete job views for user's jobs
  DELETE FROM public.job_views WHERE job_id IN (
    SELECT id FROM public.jobs WHERE user_id = target_user_id
  );
  
  -- Delete user's jobs
  DELETE FROM public.jobs WHERE user_id = target_user_id;
  
  -- Delete subscriptions
  DELETE FROM public.subscriptions WHERE user_id = target_user_id;
  
  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Note: We cannot delete from auth.users table directly via SQL
  -- This needs to be handled by the client using Supabase Admin API
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'message', 'User data deleted successfully. Complete account deletion requires admin API call.',
    'user_id', target_user_id
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
$$;