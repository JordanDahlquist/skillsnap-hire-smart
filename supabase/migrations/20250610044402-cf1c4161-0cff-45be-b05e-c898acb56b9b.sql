
-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled', 'paused');

-- Create plan type enum  
CREATE TYPE plan_type AS ENUM ('starter', 'professional', 'enterprise');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paddle_customer_id TEXT,
  paddle_subscription_id TEXT,
  status subscription_status NOT NULL DEFAULT 'trial',
  plan_type plan_type NOT NULL DEFAULT 'starter',
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  job_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  applications_count_reset_date TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscription" 
  ON public.subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert subscriptions" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to automatically create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Create function to check if user has active subscription or trial
CREATE OR REPLACE FUNCTION public.user_has_active_access(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create function to get user's plan limits
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
