
import { useQuery } from "@tanstack/react-query";
import { jobMetricsService } from "@/services/jobMetricsService";
import { logger } from "@/services/loggerService";

export const useJobMetrics = (jobId: string) => {
  return useQuery({
    queryKey: ['job-metrics', jobId],
    queryFn: async () => {
      logger.debug('Fetching metrics for job:', jobId);
      return await jobMetricsService.calculateJobMetrics(jobId);
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useBulkJobMetrics = (jobIds: string[]) => {
  return useQuery({
    queryKey: ['bulk-job-metrics', jobIds],
    queryFn: async () => {
      logger.debug('Fetching bulk metrics for jobs:', jobIds.length);
      return await jobMetricsService.calculateBulkJobMetrics(jobIds);
    },
    enabled: jobIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
