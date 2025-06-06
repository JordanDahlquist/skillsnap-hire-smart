
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";

type JobRow = Database['public']['Tables']['jobs']['Row'];

export interface Job extends JobRow {
  applications?: { count: number }[];
}

export const useJobs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for jobs query');
        return [];
      }
      
      console.log('Fetching jobs for user:', user.id);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('Jobs query result:', {
        data: data || [],
        error,
        totalJobs: data?.length || 0,
        jobStatuses: data?.map(job => ({ id: job.id, title: job.title, status: job.status })) || []
      });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      return data as Job[];
    },
    enabled: !!user?.id,
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
