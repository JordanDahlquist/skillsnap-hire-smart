
-- Update the user's unique email to use the inbound subdomain
UPDATE public.profiles 
SET unique_email = 'jordan-dahlquist@inbound.atract.ai'
WHERE unique_email = 'jordan-dahlquist@atract.ai';

-- Also update the email generation function to use inbound subdomain by default
CREATE OR REPLACE FUNCTION public.generate_unique_email(user_id uuid, full_name text, email text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  base_email text;
  final_email text;
  counter integer := 0;
  existing_count integer;
BEGIN
  -- Extract first and last name from full_name or fall back to email prefix
  IF full_name IS NOT NULL AND length(trim(full_name)) > 0 THEN
    -- Clean and format the full name
    base_email := lower(regexp_replace(trim(full_name), '[^a-zA-Z0-9\s]', '', 'g'));
    base_email := regexp_replace(base_email, '\s+', '-', 'g');
  ELSE
    -- Fall back to email prefix
    base_email := split_part(email, '@', 1);
    base_email := lower(regexp_replace(base_email, '[^a-zA-Z0-9]', '', 'g'));
  END IF;
  
  -- Ensure we have something to work with
  IF length(base_email) = 0 THEN
    base_email := 'user';
  END IF;
  
  -- Limit length to reasonable size
  IF length(base_email) > 20 THEN
    base_email := left(base_email, 20);
  END IF;
  
  -- Use inbound subdomain instead of main domain
  final_email := base_email || '@inbound.atract.ai';
  
  -- Check if email already exists and add counter if needed
  SELECT COUNT(*) INTO existing_count 
  FROM public.profiles 
  WHERE unique_email = final_email AND id != user_id;
  
  WHILE existing_count > 0 LOOP
    counter := counter + 1;
    final_email := base_email || counter || '@inbound.atract.ai';
    
    SELECT COUNT(*) INTO existing_count 
    FROM public.profiles 
    WHERE unique_email = final_email AND id != user_id;
  END LOOP;
  
  RETURN final_email;
END;
$function$;
