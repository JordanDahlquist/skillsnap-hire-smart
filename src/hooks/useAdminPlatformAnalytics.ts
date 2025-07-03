
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from './useAdminRole';
import { logger } from '@/services/loggerService';

interface AdminPlatformAnalytics {
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

interface DailyStats {
  period: string;
  user_count: number;
  job_count: number;
  application_count: number;
}

export const useAdminPlatformAnalytics = () => {
  const { isSuperAdmin, isLoading: adminLoading } = useAdminRole();
  const [analytics, setAnalytics] = useState<AdminPlatformAnalytics | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminAnalytics = async () => {
      if (adminLoading) return;
      
      if (!isSuperAdmin) {
        setError('Access denied. Super admin role required.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        logger.info('Fetching admin platform analytics');

        // Get platform stats using the admin function
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_admin_platform_stats');

        if (statsError) {
          logger.error('Error fetching admin platform stats:', statsError);
          throw statsError;
        }

        // Get daily stats using the admin function
        const { data: dailyData, error: dailyError } = await supabase
          .rpc('get_admin_user_stats');

        if (dailyError) {
          logger.error('Error fetching admin daily stats:', dailyError);
          throw dailyError;
        }

        logger.info('Admin analytics fetched successfully', { 
          stats: statsData, 
          dailyRecords: dailyData?.length 
        });

        setAnalytics(statsData);
        setDailyStats(dailyData || []);

      } catch (err: any) {
        logger.error('Failed to fetch admin analytics:', err);
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminAnalytics();
  }, [isSuperAdmin, adminLoading]);

  const refetch = () => {
    if (isSuperAdmin) {
      setIsLoading(true);
      setError(null);
      // Trigger re-fetch by updating a dependency
      window.location.reload();
    }
  };

  return { 
    analytics, 
    dailyStats, 
    isLoading: isLoading || adminLoading, 
    error, 
    refetch,
    isAuthorized: isSuperAdmin
  };
};
