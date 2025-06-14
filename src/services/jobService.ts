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
          applications(
            id,
            status,
            pipeline_stage,
            manual_rating,
            ai_rating
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching jobs:', error);
        return { data: [], error: null };
      }
      
      // Process the data to add computed application counts
      const processedJobs = (data || []).map(job => {
        const applications = job.applications || [];
        const totalApplications = applications.length;
        
        // Calculate status counts from actual applications
        const applicationStatusCounts = {
          pending: applications.filter(app => app.status === 'pending').length,
          approved: applications.filter(app => app.status === 'approved').length,
          rejected: applications.filter(app => app.status === 'rejected').length,
          unranked: applications.filter(app => !app.manual_rating && !app.ai_rating).length,
          total: totalApplications
        };

        // Add needs review flag for unranked applications
        const needsReview = applicationStatusCounts.unranked > 0;

        return {
          ...job,
          applicationStatusCounts,
          needsReview,
          // Keep the applications array for backward compatibility
          applications: [{ count: totalApplications }]
        };
      });
      
      logger.debug('Fetched jobs with application counts:', processedJobs.length);
      return { data: processedJobs, error: null };
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
