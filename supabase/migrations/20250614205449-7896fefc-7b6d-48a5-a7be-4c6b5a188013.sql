
-- Create function to get all user roles for admin panel
CREATE OR REPLACE FUNCTION public.get_all_user_roles()
RETURNS TABLE(user_id UUID, role app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT user_roles.user_id, user_roles.role
  FROM public.user_roles
$$;
