
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
        const { data: statsData, error: statsError } = await supabase.rpc(
          'get_admin_platform_stats'
        );

        if (statsError) {
          logger.error('Error fetching admin platform stats:', statsError);
          throw statsError;
        }

        // Get daily stats using the admin function
        const { data: dailyData, error: dailyError } = await supabase.rpc(
          'get_admin_user_stats'
        );

        if (dailyError) {
          logger.error('Error fetching admin daily stats:', dailyError);
          throw dailyError;
        }

        logger.info('Admin analytics fetched successfully', { 
          stats: statsData, 
          dailyRecords: Array.isArray(dailyData) ? dailyData.length : 0
        });

        // Type cast the response data properly
        if (statsData && typeof statsData === 'object' && !Array.isArray(statsData)) {
          setAnalytics(statsData as unknown as AdminPlatformAnalytics);
        } else {
          throw new Error('Invalid stats data format');
        }

        if (Array.isArray(dailyData)) {
          setDailyStats(dailyData as DailyStats[]);
        } else {
          setDailyStats([]);
        }

      } catch (err: any) {
        logger.error('Failed to fetch admin analytics:', err);
        setError(err.message || 'Failed to fetch analytics');
        
        // Set default values on error
        setAnalytics({
          totalUsers: 0,
          usersLast30Days: 0,
          usersLast7Days: 0,
          totalJobs: 0,
          jobsLast30Days: 0,
          totalApplications: 0,
          applicationsLast30Days: 0,
          activeSubscriptions: 0,
          trialSubscriptions: 0
        });
        setDailyStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminAnalytics();
  }, [isSuperAdmin, adminLoading]);

  const refetch = async () => {
    if (isSuperAdmin) {
      setIsLoading(true);
      setError(null);
      // Trigger re-fetch by calling the effect logic again
      const event = new Event('storage');
      window.dispatchEvent(event);
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
