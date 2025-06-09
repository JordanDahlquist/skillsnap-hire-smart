
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Application } from "@/types";
import { DatabaseApplication } from "@/types/supabase";

export const useAllApplications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get all jobs for this user
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('user_id', user.id);
      
      if (jobsError) throw jobsError;
      if (!jobs || jobs.length === 0) return [];
      
      const jobIds = jobs.map(job => job.id);
      
      // Then get all applications for these jobs
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });
      
      if (appsError) throw appsError;
      
      // Transform Supabase data to Application type
      return (applications || []).map((app: DatabaseApplication): Application => ({
        ...app,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
