
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getStartOfWeek } from "@/utils/dateUtils";

export interface Application {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  created_at: string;
  ai_rating: number | null;
  ai_summary: string | null;
  status: string;
  experience: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
}

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
      return data as Application[];
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
