
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Use Promise.allSettled to handle potential errors gracefully
        const results = await Promise.allSettled([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('jobs').select('*', { count: 'exact', head: true }),
          supabase.from('applications').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('jobs').select('created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('applications').select('created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('subscriptions').select('status')
        ]);

        // Extract data with fallbacks
        const totalUsers = results[0].status === 'fulfilled' ? results[0].value.count || 0 : 0;
        const totalJobs = results[1].status === 'fulfilled' ? results[1].value.count || 0 : 0;
        const totalApplications = results[2].status === 'fulfilled' ? results[2].value.count || 0 : 0;
        const recentUsers = results[3].status === 'fulfilled' ? results[3].value.data || [] : [];
        const recentJobs = results[4].status === 'fulfilled' ? results[4].value.data || [] : [];
        const recentApplications = results[5].status === 'fulfilled' ? results[5].value.data || [] : [];
        const subscriptions = results[6].status === 'fulfilled' ? results[6].value.data || [] : [];

        const usersLast7Days = recentUsers?.filter(user => 
          new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0;

        const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;
        const trialSubscriptions = subscriptions?.filter(sub => sub.status === 'trial').length || 0;

        setAnalytics({
          totalUsers,
          usersLast30Days: recentUsers?.length || 0,
          usersLast7Days,
          totalJobs,
          jobsLast30Days: recentJobs?.length || 0,
          totalApplications,
          applicationsLast30Days: recentApplications?.length || 0,
          activeSubscriptions,
          trialSubscriptions
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, isLoading, error, refetch: () => window.location.reload() };
};
