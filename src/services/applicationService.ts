
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "./apiClient";
import { logger } from "./loggerService";
import { Application } from "@/types";

export const applicationService = {
  async fetchApplications(jobId: string): Promise<Application[]> {
    return apiClient.query(async () => {
      logger.debug('Fetching applications for job:', jobId);
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching applications:', error);
        return { data: [], error: null };
      }
      
      logger.debug('Fetched applications:', data?.length || 0);
      return { data: data || [], error: null };
    });
  },

  async updateApplication(applicationId: string, updates: Partial<Application>) {
    return apiClient.mutate(async () => {
      logger.debug('Updating application:', applicationId, updates);
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
      logger.debug('Bulk updating applications:', applicationIds, updates);
      return await supabase
        .from('applications')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in('id', applicationIds);
    });
  }
};
