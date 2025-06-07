
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  const { organizationMembership } = useAuth();

  return useQuery({
    queryKey: ['organization-jobs', organizationMembership?.organization_id],
    queryFn: async () => {
      if (!organizationMembership?.organization_id) {
        console.log('No organization ID available for jobs query');
        return [];
      }
      
      console.log('Fetching jobs for organization:', organizationMembership.organization_id);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications(count)
        `)
        .eq('organization_id', organizationMembership.organization_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      // Fetch application status counts for each job
      const jobsWithStatusCounts = await Promise.all(
        (data || []).map(async (job) => {
          const { data: statusCounts } = await supabase
            .from('applications')
            .select('status')
            .eq('job_id', job.id);

          const applicationStatusCounts = {
            pending: statusCounts?.filter(app => app.status === 'pending').length || 0,
            approved: statusCounts?.filter(app => app.status === 'approved').length || 0,
            rejected: statusCounts?.filter(app => app.status === 'rejected').length || 0,
          };

          return {
            ...job,
            applicationStatusCounts
          };
        })
      );
      
      console.log('Jobs query result:', {
        data: jobsWithStatusCounts || [],
        error,
        totalJobs: jobsWithStatusCounts?.length || 0,
        jobStatuses: jobsWithStatusCounts?.map(job => ({ 
          id: job.id, 
          title: job.title, 
          status: job.status,
          pendingApplications: job.applicationStatusCounts?.pending || 0
        })) || []
      });
      
      return jobsWithStatusCounts as Job[];
    },
    enabled: !!organizationMembership?.organization_id,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });
};

export const useJob = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID provided');
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      return data as JobRow;
    },
    enabled: !!jobId,
  });
};
