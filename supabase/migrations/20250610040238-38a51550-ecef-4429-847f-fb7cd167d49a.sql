
-- Update profiles table to store all signup form data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS job_title_signup text,
ADD COLUMN IF NOT EXISTS hiring_goals jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hires_per_month text,
ADD COLUMN IF NOT EXISTS current_tools jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS biggest_challenges jsonb DEFAULT '[]'::jsonb;

-- Update the handle_new_user function to process complete signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  generated_email text;
BEGIN
  -- Generate unique email
  generated_email := public.generate_unique_email(
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  
  -- Insert profile with all signup data
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
      generated_email
    );
    RETURN new;
END;
$$;
