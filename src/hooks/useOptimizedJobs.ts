
import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/jobService";
import { logger } from "@/services/loggerService";
import { environment } from "@/config/environment";

export const useOptimizedJobs = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['jobs', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const startTime = Date.now();
      logger.debug('useOptimizedJobs - Fetching jobs for user:', userId);
      
      try {
        const jobs = await jobService.fetchJobs(userId);
        const duration = Date.now() - startTime;
        
        if (environment.enablePerformanceMonitoring) {
          logger.debug('Jobs fetch performance', { duration, jobCount: jobs.length });
        }
        
        return jobs;
      } catch (error) {
        logger.error('Optimized jobs fetch failed:', error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: environment.cacheStaleTime, // 10 minutes
    gcTime: environment.cacheGcTime, // 20 minutes
    refetchOnMount: false, // Prevent unnecessary refetches
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useOptimizedJob = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const startTime = Date.now();
      logger.debug('useOptimizedJob - Fetching job:', jobId);
      
      try {
        const job = await jobService.fetchJob(jobId);
        const duration = Date.now() - startTime;
        
        if (environment.enablePerformanceMonitoring) {
          logger.debug('Job fetch performance', { duration, jobId });
        }
        
        return job;
      } catch (error) {
        logger.error('Optimized job fetch failed:', error);
        throw error;
      }
    },
    enabled: !!jobId,
    staleTime: environment.cacheStaleTime,
    gcTime: environment.cacheGcTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
