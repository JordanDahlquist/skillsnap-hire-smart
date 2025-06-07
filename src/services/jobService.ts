
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./apiClient";
import { Job } from "@/types";

export const jobService = {
  async fetchJobs(organizationId: string): Promise<Job[]> {
    if (!organizationId) {
      return [];
    }

    return apiClient.query(async () => {
      console.log('Fetching jobs for organization:', organizationId);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications!inner(count)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return { data: [], error: null };
      }
      
      console.log('Fetched jobs:', data?.length || 0);
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
