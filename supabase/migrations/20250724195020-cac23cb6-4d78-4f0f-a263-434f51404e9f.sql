-- Implement company-based unique emails with duplicate prevention

-- Step 1: First handle existing duplicate company names
-- Update the second "Aeon Marketing" user to make it unique
UPDATE public.profiles 
SET company_name = 'Aeon Marketing LLC',
    updated_at = now()
WHERE email = 'jordan@huntingtonpacificmedia.com'
AND company_name = 'Aeon Marketing';

-- Step 2: Add unique constraint on company_name
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_company_name_unique UNIQUE (company_name);

-- Step 3: Update the generate_unique_email function to use company names
CREATE OR REPLACE FUNCTION public.generate_unique_email(user_id uuid, full_name text, email text, company_name text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  clean_company text;
  base_email text;
  final_email text;
  counter integer := 2;
  existing_count integer;
  patterns text[] := ARRAY[
    'hiring.{company}',
    'talent.{company}',
    'hr.{company}',
    'recruiting.{company}',
    'jobs.{company}',
    'hiring.{company}.{counter}'
  ];
  pattern text;
BEGIN
  -- Use provided company_name or extract from existing logic
  IF company_name IS NOT NULL AND length(trim(company_name)) > 0 THEN
    clean_company := company_name;
  ELSE
    -- Fallback to user name if no company name
    IF full_name IS NOT NULL AND length(trim(full_name)) > 0 THEN
      clean_company := split_part(trim(full_name), ' ', 1);
    ELSE
      clean_company := split_part(email, '@', 1);
    END IF;
  END IF;
  
  -- Clean company name: remove special characters, convert to lowercase, replace spaces with hyphens
  clean_company := lower(regexp_replace(trim(clean_company), '[^a-zA-Z0-9\s]', '', 'g'));
  clean_company := regexp_replace(clean_company, '\s+', '-', 'g');
  
  -- Ensure we have something to work with
  IF length(clean_company) = 0 THEN
    clean_company := 'company';
  END IF;
  
  -- Limit length to reasonable size
  IF length(clean_company) > 20 THEN
    clean_company := left(clean_company, 20);
  END IF;
  
  -- Try different patterns until we find a unique one
  FOR i IN 1..array_length(patterns, 1) LOOP
    pattern := patterns[i];
    
    -- Replace placeholders in pattern
    base_email := pattern;
    base_email := replace(base_email, '{company}', clean_company);
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
    IF pattern = 'hiring.{company}.{counter}' THEN
      WHILE existing_count > 0 AND counter < 100 LOOP
        counter := counter + 1;
        base_email := 'hiring.' || clean_company || '.' || counter;
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
  RETURN 'hiring-' || replace(gen_random_uuid()::text, '-', '') || '@inbound.atract.ai';
END;
$function$;

-- Step 4: Update the handle_new_user function to pass company_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  generated_email text;
  retry_count integer := 0;
  max_retries integer := 5;
  company_name_value text;
BEGIN
  -- Get company name from metadata
  company_name_value := COALESCE(new.raw_user_meta_data ->> 'company_name', 'Your Company');
  
  -- Generate unique email with retry logic
  LOOP
    generated_email := public.generate_unique_email(
      new.id, 
      new.raw_user_meta_data ->> 'full_name',
      new.email,
      company_name_value
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
        company_name_value,
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
          generated_email := 'hiring-' || replace(gen_random_uuid()::text, '-', '') || '@inbound.atract.ai';
          
          INSERT INTO public.profiles (id, full_name, email, company_name, unique_email)
          VALUES (
            new.id, 
            new.raw_user_meta_data ->> 'full_name', 
            new.email,
            company_name_value,
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
      company_name_value,
      'hiring-' || replace(gen_random_uuid()::text, '-', '') || '@inbound.atract.ai'
    );
    RETURN new;
END;
$function$;

-- Step 5: Update all existing unique emails to the new company-based format
UPDATE public.profiles 
SET unique_email = public.generate_unique_email(id, full_name, email, company_name),
    updated_at = now()
WHERE unique_email IS NOT NULL;