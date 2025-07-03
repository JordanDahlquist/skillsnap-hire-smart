
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/services/loggerService';

interface PlatformAnalytics {
  totalUsers: number;
  usersLast30Days: number;
  usersLast7Days: number;
  totalJobs: number;
  jobsLast30Days: number;
  totalApplications: number;
  applicationsLast30Days: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
}

export const usePlatformAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) {
        setAnalytics(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        logger.info('Fetching user-specific analytics');

        // For regular users, show only their own data
        const [
          { data: userJobs, error: jobsError },
          { data: userApplications, error: applicationsError },
          { data: userSubscription, error: subscriptionError }
        ] = await Promise.all([
          supabase
            .from('jobs')
            .select('id, created_at')
            .eq('user_id', user.id),
          supabase
            .from('applications')
            .select('id, created_at')
            .in('job_id', 
              await supabase
                .from('jobs')
                .select('id')
                .eq('user_id', user.id)
                .then(({ data }) => data?.map(j => j.id) || [])
            ),
          supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .single()
        ]);

        if (jobsError) {
          logger.error('Error fetching user jobs:', jobsError);
        }

        if (applicationsError) {
          logger.error('Error fetching user applications:', applicationsError);
        }

        if (subscriptionError) {
          logger.error('Error fetching user subscription:', subscriptionError);
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const jobsLast30Days = (userJobs || []).filter(
          job => new Date(job.created_at) >= thirtyDaysAgo
        ).length;

        const applicationsLast30Days = (userApplications || []).filter(
          app => new Date(app.created_at) >= thirtyDaysAgo
        ).length;

        // For regular users, analytics show their personal stats
        setAnalytics({
          totalUsers: 1, // Just the current user
          usersLast30Days: 0, // Not applicable for single user
          usersLast7Days: 0, // Not applicable for single user
          totalJobs: (userJobs || []).length,
          jobsLast30Days,
          totalApplications: (userApplications || []).length,
          applicationsLast30Days,
          activeSubscriptions: userSubscription?.status === 'active' ? 1 : 0,
          trialSubscriptions: userSubscription?.status === 'trial' ? 1 : 0
        });

        logger.info('User analytics fetched successfully');

      } catch (err: any) {
        logger.error('Failed to fetch user analytics:', err);
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id]);

  const refetch = () => {
    setIsLoading(true);
    setError(null);
    // Simple refetch by reloading
    window.location.reload();
  };

  return { analytics, isLoading, error, refetch };
};
