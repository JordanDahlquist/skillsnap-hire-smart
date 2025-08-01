-- Fix Function Search Path Mutable security warnings
-- Add SET search_path = '' to all affected database functions

CREATE OR REPLACE FUNCTION public.cleanup_old_briefings()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Delete briefings older than 7 days
  DELETE FROM public.daily_briefings 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_create_default_hiring_stages()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Create default hiring stages for the new job
  PERFORM public.create_default_hiring_stages(NEW.id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_hiring_stages(job_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Insert the 5 default hiring stages including Rejected
  INSERT INTO public.hiring_stages (job_id, name, order_index, color, is_default) VALUES
    (job_id, 'Applied', 1, '#6b7280', true),
    (job_id, 'Under Review', 2, '#f59e0b', true),
    (job_id, 'Interview', 3, '#3b82f6', true),
    (job_id, 'Hired', 4, '#10b981', true),
    (job_id, 'Rejected', 5, '#dc2626', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_active_access(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  subscription_record RECORD;
BEGIN
  SELECT * INTO subscription_record
  FROM public.subscriptions
  WHERE subscriptions.user_id = user_has_active_access.user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if trial is still active
  IF subscription_record.status = 'trial' AND subscription_record.trial_end_date > NOW() THEN
    RETURN TRUE;
  END IF;
  
  -- Check if subscription is active
  IF subscription_record.status = 'active' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_job_view(p_job_id uuid, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_referrer text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_existing_count integer;
BEGIN
  -- Check if this IP has already viewed this job today
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM public.job_views 
    WHERE job_id = p_job_id 
    AND ip_address = p_ip_address 
    AND viewed_at >= CURRENT_DATE 
    AND viewed_at < CURRENT_DATE + INTERVAL '1 day';
    
    -- If already viewed today, don't count it again
    IF v_existing_count > 0 THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Insert the view record
  INSERT INTO public.job_views (job_id, ip_address, user_agent, referrer)
  VALUES (p_job_id, p_ip_address, p_user_agent, p_referrer);
  
  -- Increment the view count on the jobs table
  UPDATE public.jobs 
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = p_job_id;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  subscription_record RECORD;
  limits JSON;
BEGIN
  SELECT * INTO subscription_record
  FROM public.subscriptions
  WHERE subscriptions.user_id = get_user_plan_limits.user_id;
  
  IF NOT FOUND THEN
    RETURN '{"max_jobs": 0, "max_applications": 0, "has_scout_ai": false}'::JSON;
  END IF;
  
  CASE subscription_record.plan_type
    WHEN 'starter' THEN
      limits := '{"max_jobs": 3, "max_applications": 100, "has_scout_ai": false}'::JSON;
    WHEN 'professional' THEN
      limits := '{"max_jobs": 15, "max_applications": 500, "has_scout_ai": true}'::JSON;
    WHEN 'enterprise' THEN
      limits := '{"max_jobs": -1, "max_applications": -1, "has_scout_ai": true}'::JSON;
    ELSE
      limits := '{"max_jobs": 0, "max_applications": 0, "has_scout_ai": false}'::JSON;
  END CASE;
  
  RETURN limits;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_platform_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  result JSON;
  total_users_count INTEGER;
  users_last_30_days_count INTEGER;
  users_last_7_days_count INTEGER;
  total_jobs_count INTEGER;
  jobs_last_30_days_count INTEGER;
  total_applications_count INTEGER;
  applications_last_30_days_count INTEGER;
  active_subscriptions_count INTEGER;
  trial_subscriptions_count INTEGER;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Super admin role required.';
  END IF;

  -- Get total users count
  SELECT COUNT(*) INTO total_users_count FROM auth.users;
  
  -- Get users from last 30 days
  SELECT COUNT(*) INTO users_last_30_days_count 
  FROM auth.users 
  WHERE created_at >= NOW() - INTERVAL '30 days';
  
  -- Get users from last 7 days
  SELECT COUNT(*) INTO users_last_7_days_count 
  FROM auth.users 
  WHERE created_at >= NOW() - INTERVAL '7 days';

  -- Get total jobs count
  SELECT COUNT(*) INTO total_jobs_count FROM public.jobs;
  
  -- Get jobs from last 30 days
  SELECT COUNT(*) INTO jobs_last_30_days_count 
  FROM public.jobs 
  WHERE created_at >= NOW() - INTERVAL '30 days';

  -- Get total applications count
  SELECT COUNT(*) INTO total_applications_count FROM public.applications;
  
  -- Get applications from last 30 days
  SELECT COUNT(*) INTO applications_last_30_days_count 
  FROM public.applications 
  WHERE created_at >= NOW() - INTERVAL '30 days';

  -- Get active subscriptions count
  SELECT COUNT(*) INTO active_subscriptions_count 
  FROM public.subscriptions 
  WHERE status = 'active';

  -- Get trial subscriptions count
  SELECT COUNT(*) INTO trial_subscriptions_count 
  FROM public.subscriptions 
  WHERE status = 'trial';

  -- Build result JSON
  SELECT json_build_object(
    'totalUsers', total_users_count,
    'usersLast30Days', users_last_30_days_count,
    'usersLast7Days', users_last_7_days_count,
    'totalJobs', total_jobs_count,
    'jobsLast30Days', jobs_last_30_days_count,
    'totalApplications', total_applications_count,
    'applicationsLast30Days', applications_last_30_days_count,
    'activeSubscriptions', active_subscriptions_count,
    'trialSubscriptions', trial_subscriptions_count
  ) INTO result;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_user_stats()
 RETURNS TABLE(period text, user_count integer, job_count integer, application_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Super admin role required.';
  END IF;

  -- Return daily stats for the last 30 days
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE as day
  ),
  daily_users AS (
    SELECT 
      DATE(created_at) as day,
      COUNT(*) as user_count
    FROM auth.users
    WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(created_at)
  ),
  daily_jobs AS (
    SELECT 
      DATE(created_at) as day,
      COUNT(*) as job_count
    FROM public.jobs
    WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(created_at)
  ),
  daily_applications AS (
    SELECT 
      DATE(created_at) as day,
      COUNT(*) as application_count
    FROM public.applications
    WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.day::TEXT as period,
    COALESCE(du.user_count, 0)::INTEGER as user_count,
    COALESCE(dj.job_count, 0)::INTEGER as job_count,
    COALESCE(da.application_count, 0)::INTEGER as application_count
  FROM date_series ds
  LEFT JOIN daily_users du ON ds.day = du.day
  LEFT JOIN daily_jobs dj ON ds.day = dj.day
  LEFT JOIN daily_applications da ON ds.day = da.day
  ORDER BY ds.day;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_all_user_roles()
 RETURNS TABLE(user_id uuid, role app_role)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT user_roles.user_id, user_roles.role
  FROM public.user_roles
$function$;

CREATE OR REPLACE FUNCTION public.generate_unique_email(user_id uuid, full_name text, email text, company_name text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.update_thread_on_message_read()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Only update if is_read changed from FALSE to TRUE for inbound messages
  IF OLD.is_read = FALSE AND NEW.is_read = TRUE AND NEW.direction = 'inbound' THEN
    UPDATE public.email_threads 
    SET 
      unread_count = GREATEST(unread_count - 1, 0),
      updated_at = NOW()
    WHERE id = NEW.thread_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_thread_on_message_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.email_threads 
  SET 
    last_message_at = NEW.created_at,
    unread_count = CASE 
      WHEN NEW.direction = 'inbound' AND NEW.is_read = FALSE 
      THEN unread_count + 1 
      ELSE unread_count 
    END,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_unique_email(user_id uuid, full_name text, email text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
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