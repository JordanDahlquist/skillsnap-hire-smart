
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { jobService } from "@/services/jobService";
import { logger } from "@/services/loggerService";

export const useJobs = () => {
  const { user, loading } = useAuth();
  
  logger.debug('useJobs - Using user ID:', user?.id);
  logger.debug('useJobs - Auth loading:', loading);

  return useQuery({
    queryKey: ['jobs', user?.id],
    queryFn: () => jobService.fetchJobs(user?.id || ''),
    enabled: !!user?.id && !loading,
    retry: 2,
    staleTime: 30000,
  });
};

export const useJob = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.fetchJob(jobId!),
    enabled: !!jobId,
    retry: 2,
    staleTime: 30000,
  });
};
