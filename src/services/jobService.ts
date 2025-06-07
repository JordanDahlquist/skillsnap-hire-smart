
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./apiClient";
import { logger } from "./loggerService";
import { Job } from "@/types";

export const jobService = {
  async fetchJobs(userId: string): Promise<Job[]> {
    if (!userId) {
      return [];
    }

    return apiClient.query(async () => {
      logger.debug('Fetching jobs for user:', userId);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications!inner(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching jobs:', error);
        return { data: [], error: null };
      }
      
      logger.debug('Fetched jobs:', data?.length || 0);
      return { data: data || [], error: null };
    });
  },

  async fetchJob(jobId: string) {
    return apiClient.query(async () => {
      return await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
    });
  },

  async updateJobs(jobIds: string[], updates: Partial<Job>) {
    return apiClient.mutate(async () => {
      return await supabase
        .from('jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in('id', jobIds);
    });
  }
};
