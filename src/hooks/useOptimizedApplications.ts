
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggerService";
import { environment } from "@/config/environment";
import { Application } from "@/types";

export const useOptimizedApplications = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const startTime = Date.now();
      logger.debug('useOptimizedApplications - Fetching applications for job:', jobId);
      
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false });
        
        if (error) {
          logger.error('Optimized applications fetch error:', error);
          throw error;
        }
        
        const duration = Date.now() - startTime;
        logger.debug('Applications fetched:', data?.length || 0);
        
        if (environment.enablePerformanceMonitoring) {
          logger.debug('Applications fetch performance', { 
            duration, 
            applicationCount: data?.length || 0,
            jobId 
          });
        }
        
        return (data || []) as Application[];
      } catch (error) {
        logger.error('Optimized applications fetch failed:', error);
        throw error;
      }
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes for applications (more dynamic)
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
