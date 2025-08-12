-- Remove overly permissive public SELECT policy on profiles
DROP POLICY IF EXISTS "Allow email existence check for signup" ON public.profiles;

-- Create a safe RPC to check if an email exists without exposing any profile data
CREATE OR REPLACE FUNCTION public.email_exists(p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE lower(email) = lower(p_email)
  );
$function$;

-- Allow unauthenticated callers (anon) to execute this function for signup checks only
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon;