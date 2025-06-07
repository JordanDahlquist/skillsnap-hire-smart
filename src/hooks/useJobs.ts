
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { jobService } from "@/services/jobService";
import { logger } from "@/services/loggerService";

export const useJobs = () => {
  const { profile, organizationMembership, dataLoading } = useAuth();
  
  const organizationId = organizationMembership?.organization_id || profile?.default_organization_id;
  
  logger.debug('useJobs - Using organization ID:', organizationId);
  logger.debug('useJobs - From membership:', organizationMembership?.organization_id);
  logger.debug('useJobs - From profile:', profile?.default_organization_id);
  logger.debug('useJobs - Data loading:', dataLoading);

  return useQuery({
    queryKey: ['jobs', organizationId],
    queryFn: () => jobService.fetchJobs(organizationId || ''),
    enabled: !!organizationId && !dataLoading,
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
