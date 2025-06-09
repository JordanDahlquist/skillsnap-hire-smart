
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getStartOfWeek } from "@/utils/dateUtils";
import { Application } from "@/types";
import { DatabaseApplication } from "@/types/supabase";

export const useApplications = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform Supabase data to Application type
      return (data || []).map((app: DatabaseApplication): Application => ({
        ...app,
      }));
    },
    enabled: !!jobId,
  });
};

export const useRecentApplications = (jobIds: string[]) => {
  return useQuery({
    queryKey: ['recent-applications', jobIds],
    queryFn: async () => {
      if (jobIds.length === 0) return [];
      
      const oneWeekAgo = getStartOfWeek();
      
      const { data, error } = await supabase
        .from('applications')
        .select('created_at, job_id')
        .in('job_id', jobIds)
        .gte('created_at', oneWeekAgo.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: jobIds.length > 0,
  });
};
