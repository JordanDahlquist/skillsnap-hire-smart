
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
  const { profile, organizationMembership } = useAuth();
  
  // Use organization_id with multiple fallback strategies
  const organizationId = organizationMembership?.organization_id || profile?.default_organization_id;
  
  console.log('useJobs - Using organization ID:', organizationId);
  console.log('useJobs - From membership:', organizationMembership?.organization_id);
  console.log('useJobs - From profile:', profile?.default_organization_id);

  return useQuery({
    queryKey: ['jobs', organizationId],
    queryFn: async () => {
      console.log('useJobs - Fetching jobs for organization:', organizationId);
      
      if (!organizationId) {
        console.log('useJobs - No organization ID available, returning empty array');
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            applications!inner(count)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('useJobs - Error fetching jobs:', error);
          // Return empty array instead of throwing to prevent loading loops
          return [];
        }
        
        console.log('useJobs - Fetched jobs:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('useJobs - Exception fetching jobs:', error);
        return [];
      }
    },
    enabled: !!organizationId,
    retry: 2,
    staleTime: 30000, // 30 seconds
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
    retry: 2,
    staleTime: 30000,
  });
};
