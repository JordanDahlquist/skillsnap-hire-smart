-- Add unique constraint to profiles.unique_email
ALTER TABLE public.profiles ADD CONSTRAINT profiles_unique_email_unique UNIQUE (unique_email);

-- Update the generate_unique_email function with professional patterns
CREATE OR REPLACE FUNCTION public.generate_unique_email(user_id uuid, full_name text, email text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  first_name text;
  last_name text;
  name_parts text[];
  base_email text;
  final_email text;
  counter integer := 2;
  existing_count integer;
  patterns text[] := ARRAY[
    '{first}.{last}',
    '{first_initial}.{last}',
    '{first}.{last_initial}',
    'hiring.{first}',
    'talent.{first}',
    '{first}.{last}.{counter}'
  ];
  pattern text;
BEGIN
  -- Extract first and last name from full_name or fall back to email prefix
  IF full_name IS NOT NULL AND length(trim(full_name)) > 0 THEN
    -- Clean and split the full name
    name_parts := string_to_array(lower(regexp_replace(trim(full_name), '[^a-zA-Z0-9\s]', '', 'g')), ' ');
    first_name := name_parts[1];
    last_name := COALESCE(name_parts[2], '');
  ELSE
    -- Fall back to email prefix
    first_name := split_part(email, '@', 1);
    first_name := lower(regexp_replace(first_name, '[^a-zA-Z0-9]', '', 'g'));
    last_name := '';
  END IF;
  
  -- Ensure we have something to work with
  IF length(first_name) = 0 THEN
    first_name := 'user';
  END IF;
  
  -- Limit length to reasonable size
  IF length(first_name) > 15 THEN
    first_name := left(first_name, 15);
  END IF;
  IF length(last_name) > 15 THEN
    last_name := left(last_name, 15);
  END IF;
  
  -- Try different patterns until we find a unique one
  FOR i IN 1..array_length(patterns, 1) LOOP
    pattern := patterns[i];
    
    -- Replace placeholders in pattern
    base_email := pattern;
    base_email := replace(base_email, '{first}', first_name);
    base_email := replace(base_email, '{last}', last_name);
    base_email := replace(base_email, '{first_initial}', left(first_name, 1));
    base_email := replace(base_email, '{last_initial}', left(last_name, 1));
    base_email := replace(base_email, '{counter}', counter::text);
    
    -- Clean up any double dots or trailing dots
    base_email := regexp_replace(base_email, '\.+', '.', 'g');
    base_email := regexp_replace(base_email, '\.$', '', 'g');
    base_email := regexp_replace(base_email, '^\.', '', 'g');
    
    final_email := base_email || '@inbound.atract.ai';
    
    -- Check if this email is unique
    SELECT COUNT(*) INTO existing_count 
    FROM public.profiles 
    WHERE unique_email = final_email AND id != user_id;
    
    IF existing_count = 0 THEN
      RETURN final_email;
    END IF;
    
    -- For the numbered pattern, try incrementing
    IF pattern = '{first}.{last}.{counter}' THEN
      WHILE existing_count > 0 AND counter < 100 LOOP
        counter := counter + 1;
        base_email := first_name || '.' || last_name || '.' || counter;
        final_email := base_email || '@inbound.atract.ai';
        
        SELECT COUNT(*) INTO existing_count 
        FROM public.profiles 
        WHERE unique_email = final_email AND id != user_id;
      END LOOP;
      
      IF existing_count = 0 THEN
        RETURN final_email;
      END IF;
    END IF;
  END LOOP;
  
  -- Fallback: use UUID if all patterns failed
  RETURN 'user-' || replace(gen_random_uuid()::text, '-', '') || '@inbound.atract.ai';
END;
$function$;

-- Update handle_new_user trigger to handle unique constraint violations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  generated_email text;
  retry_count integer := 0;
  max_retries integer := 5;
BEGIN
  -- Generate unique email with retry logic
  LOOP
    generated_email := public.generate_unique_email(
      new.id, 
      new.raw_user_meta_data ->> 'full_name',
      new.email
    );
    
    BEGIN
      -- Try to insert profile with generated email
      INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        company_name, 
        unique_email,
        company_size,
        industry,
        job_title_signup,
        hiring_goals,
        hires_per_month,
        current_tools,
        biggest_challenges
      )
      VALUES (
        new.id, 
        new.raw_user_meta_data ->> 'full_name', 
        new.email,
        COALESCE(new.raw_user_meta_data ->> 'company_name', 'Your Company'),
        generated_email,
        new.raw_user_meta_data ->> 'company_size',
        new.raw_user_meta_data ->> 'industry',
        new.raw_user_meta_data ->> 'job_title',
        COALESCE((new.raw_user_meta_data ->> 'hiring_goals')::jsonb, '[]'::jsonb),
        new.raw_user_meta_data ->> 'hires_per_month',
        COALESCE((new.raw_user_meta_data ->> 'current_tools')::jsonb, '[]'::jsonb),
        COALESCE((new.raw_user_meta_data ->> 'biggest_challenges')::jsonb, '[]'::jsonb)
      );
      
      -- If we get here, the insert succeeded
      EXIT;
      
    EXCEPTION
      WHEN unique_violation THEN
        retry_count := retry_count + 1;
        IF retry_count >= max_retries THEN
          -- Final fallback: use UUID-based email
          generated_email := 'user-' || replace(gen_random_uuid()::text, '-', '') || '@inbound.atract.ai';
          
          INSERT INTO public.profiles (id, full_name, email, company_name, unique_email)
          VALUES (
            new.id, 
            new.raw_user_meta_data ->> 'full_name', 
            new.email,
            COALESCE(new.raw_user_meta_data ->> 'company_name', 'Your Company'),
            generated_email
          );
          EXIT;
        END IF;
        -- Continue loop to retry with new email
    END;
  END LOOP;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    -- Create minimal profile as fallback
    INSERT INTO public.profiles (id, full_name, email, company_name, unique_email)
    VALUES (
      new.id, 
      new.raw_user_meta_data ->> 'full_name', 
      new.email,
      COALESCE(new.raw_user_meta_data ->> 'company_name', 'Your Company'),
      'user-' || replace(gen_random_uuid()::text, '-', '') || '@inbound.atract.ai'
    );
    RETURN new;
END;
$function$;