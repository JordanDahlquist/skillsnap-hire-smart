
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SubscriptionData {
  id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'paused';
  plan_type: 'starter' | 'professional' | 'enterprise';
  trial_end_date: string | null;
  subscription_end_date: string | null;
  job_count: number;
  applications_count: number;
  applications_count_reset_date: string | null;
}

export interface PlanLimits {
  max_jobs: number;
  max_applications: number;
  has_scout_ai: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveAccess, setHasActiveAccess] = useState(false);

  const fetchSubscription = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch subscription data
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
        return;
      }

      setSubscription(subscriptionData);

      // Check if user has active access
      const { data: hasAccess, error: accessError } = await supabase
        .rpc('user_has_active_access', { user_id: user.id });

      if (accessError) {
        console.error('Error checking access:', accessError);
      } else {
        setHasActiveAccess(hasAccess);
      }

      // Get plan limits
      const { data: limits, error: limitsError } = await supabase
        .rpc('get_user_plan_limits', { user_id: user.id });

      if (limitsError) {
        console.error('Error fetching limits:', limitsError);
      } else {
        // Type-safe handling of the JSON response
        if (limits && typeof limits === 'object' && !Array.isArray(limits)) {
          const limitData = limits as { max_jobs: number; max_applications: number; has_scout_ai: boolean };
          if ('max_jobs' in limitData && 'max_applications' in limitData && 'has_scout_ai' in limitData) {
            setPlanLimits({
              max_jobs: limitData.max_jobs,
              max_applications: limitData.max_applications,
              has_scout_ai: limitData.has_scout_ai
            });
          }
        }
      }

    } catch (error) {
      console.error('Error in subscription fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  const isTrialActive = () => {
    if (!subscription) return false;
    return subscription.status === 'trial' && 
           subscription.trial_end_date && 
           new Date(subscription.trial_end_date) > new Date();
  };

  const isSubscriptionActive = () => {
    return subscription?.status === 'active';
  };

  const getTrialDaysRemaining = () => {
    if (!subscription?.trial_end_date) return 0;
    const trialEnd = new Date(subscription.trial_end_date);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const canCreateJobs = () => {
    if (!planLimits || !subscription) return false;
    if (planLimits.max_jobs === -1) return true; // Unlimited
    return subscription.job_count < planLimits.max_jobs;
  };

  const canCreateApplications = () => {
    if (!planLimits || !subscription) return false;
    if (planLimits.max_applications === -1) return true; // Unlimited
    return subscription.applications_count < planLimits.max_applications;
  };

  return {
    subscription,
    planLimits,
    loading,
    hasActiveAccess,
    isTrialActive: isTrialActive(),
    isSubscriptionActive: isSubscriptionActive(),
    trialDaysRemaining: getTrialDaysRemaining(),
    canCreateJobs: canCreateJobs(),
    canCreateApplications: canCreateApplications(),
    refetch: fetchSubscription
  };
};
