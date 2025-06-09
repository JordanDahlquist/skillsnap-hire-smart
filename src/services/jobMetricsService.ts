
import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggerService";

export interface JobMetrics {
  responseRate: number;
  weeklyApplications: number;
}

export const jobMetricsService = {
  async calculateJobMetrics(jobId: string): Promise<JobMetrics> {
    try {
      // Get total applications for this job
      const { data: totalApps, error: totalError } = await supabase
        .from('applications')
        .select('id, status, created_at')
        .eq('job_id', jobId);

      if (totalError) {
        logger.error('Error fetching total applications:', totalError);
        return { responseRate: 0, weeklyApplications: 0 };
      }

      const totalApplications = totalApps?.length || 0;
      
      // Calculate response rate (approved applications / total applications)
      const approvedApplications = totalApps?.filter(app => 
        app.status === 'approved' || app.status === 'hired'
      ).length || 0;
      
      const responseRate = totalApplications > 0 
        ? Math.round((approvedApplications / totalApplications) * 100)
        : 0;

      // Calculate weekly applications (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyApplications = totalApps?.filter(app => 
        new Date(app.created_at) >= oneWeekAgo
      ).length || 0;

      return {
        responseRate,
        weeklyApplications
      };
    } catch (error) {
      logger.error('Error calculating job metrics:', error);
      return { responseRate: 0, weeklyApplications: 0 };
    }
  },

  async calculateBulkJobMetrics(jobIds: string[]): Promise<Record<string, JobMetrics>> {
    try {
      if (jobIds.length === 0) return {};

      // Get all applications for these jobs
      const { data: applications, error } = await supabase
        .from('applications')
        .select('id, job_id, status, created_at')
        .in('job_id', jobIds);

      if (error) {
        logger.error('Error fetching bulk applications:', error);
        return {};
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Group applications by job_id and calculate metrics
      const jobMetrics: Record<string, JobMetrics> = {};
      
      jobIds.forEach(jobId => {
        const jobApps = applications?.filter(app => app.job_id === jobId) || [];
        const totalApplications = jobApps.length;
        
        const approvedApplications = jobApps.filter(app => 
          app.status === 'approved' || app.status === 'hired'
        ).length;
        
        const responseRate = totalApplications > 0 
          ? Math.round((approvedApplications / totalApplications) * 100)
          : 0;

        const weeklyApplications = jobApps.filter(app => 
          new Date(app.created_at) >= oneWeekAgo
        ).length;

        jobMetrics[jobId] = {
          responseRate,
          weeklyApplications
        };
      });

      return jobMetrics;
    } catch (error) {
      logger.error('Error calculating bulk job metrics:', error);
      return {};
    }
  }
};
