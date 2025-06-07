
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { jobService } from "@/services/jobService";
import { Database } from "@/integrations/supabase/types";

type JobRow = Database['public']['Tables']['jobs']['Row'];

export interface Job extends JobRow {
  applications?: { count: number }[];
  applicationStatusCounts?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export const useJobs = () => {
  const { profile, organizationMembership, dataLoading } = useAuth();
  
  // Use organization_id with multiple fallback strategies
  const organizationId = organizationMembership?.organization_id || profile?.default_organization_id;
  
  console.log('useJobs - Using organization ID:', organizationId);
  console.log('useJobs - From membership:', organizationMembership?.organization_id);
  console.log('useJobs - From profile:', profile?.default_organization_id);
  console.log('useJobs - Data loading:', dataLoading);

  return useQuery({
    queryKey: ['jobs', organizationId],
    queryFn: () => jobService.fetchJobs(organizationId || ''),
    enabled: !!organizationId && !dataLoading,
    retry: 2,
    staleTime: 30000, // 30 seconds
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
