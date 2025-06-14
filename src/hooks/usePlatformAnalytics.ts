
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
        // Fetch all data separately since view had issues
        const [
          { count: totalUsers },
          { count: totalJobs },
          { count: totalApplications },
          { data: recentUsers },
          { data: recentJobs },
          { data: recentApplications },
          { data: subscriptions }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('jobs').select('*', { count: 'exact', head: true }),
          supabase.from('applications').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('jobs').select('created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('applications').select('created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('subscriptions').select('status')
        ]);

        const usersLast7Days = recentUsers?.filter(user => 
          new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0;

        const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;
        const trialSubscriptions = subscriptions?.filter(sub => sub.status === 'trial').length || 0;

        setAnalytics({
          totalUsers: totalUsers || 0,
          usersLast30Days: recentUsers?.length || 0,
          usersLast7Days,
          totalJobs: totalJobs || 0,
          jobsLast30Days: recentJobs?.length || 0,
          totalApplications: totalApplications || 0,
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
