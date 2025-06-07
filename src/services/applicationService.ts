
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./apiClient";
import { Application } from "@/types";

export const applicationService = {
  async fetchApplications(jobId: string): Promise<Application[]> {
    return apiClient.query(async () => {
      console.log('Fetching applications for job:', jobId);
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return { data: [], error: null };
      }
      
      console.log('Fetched applications:', data?.length || 0);
      return { data: data || [], error: null };
    });
  },

  async updateApplication(applicationId: string, updates: Partial<Application>) {
    return apiClient.mutate(async () => {
      return await supabase
        .from('applications')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', applicationId)
        .select()
        .single();
    });
  },

  async bulkUpdateApplications(applicationIds: string[], updates: Partial<Application>) {
    return apiClient.mutate(async () => {
      return await supabase
        .from('applications')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in('id', applicationIds);
    });
  }
};
