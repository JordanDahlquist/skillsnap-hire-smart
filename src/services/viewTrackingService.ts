
import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggerService";

export interface ViewTrackingData {
  jobId: string;
  userAgent?: string;
  referrer?: string;
}

export const viewTrackingService = {
  async trackJobView(data: ViewTrackingData): Promise<boolean> {
    try {
      // Call the database function to track the view
      const { data: result, error } = await supabase.rpc('track_job_view', {
        p_job_id: data.jobId,
        p_user_agent: data.userAgent || null,
        p_referrer: data.referrer || null
      });

      if (error) {
        logger.error('Error tracking job view:', error);
        return false;
      }

      logger.debug('Job view tracked successfully:', { jobId: data.jobId, tracked: result });
      return result || false;
    } catch (error) {
      logger.error('Failed to track job view:', error);
      return false;
    }
  },

  async getJobViewCount(jobId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('view_count')
        .eq('id', jobId)
        .single();

      if (error) {
        logger.error('Error fetching job view count:', error);
        return 0;
      }

      return data?.view_count || 0;
    } catch (error) {
      logger.error('Failed to fetch job view count:', error);
      return 0;
    }
  },

  async getJobViewAnalytics(jobId: string): Promise<{
    totalViews: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    uniqueViewersToday: number;
  }> {
    try {
      const { data: job } = await supabase
        .from('jobs')
        .select('view_count')
        .eq('id', jobId)
        .single();

      const { data: weeklyViews } = await supabase
        .from('job_views')
        .select('id')
        .eq('job_id', jobId)
        .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: monthlyViews } = await supabase
        .from('job_views')
        .select('id')
        .eq('job_id', jobId)
        .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: todayUniqueViews } = await supabase
        .from('job_views')
        .select('viewer_ip')
        .eq('job_id', jobId)
        .gte('viewed_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');

      const uniqueIPs = new Set(todayUniqueViews?.map(v => v.viewer_ip).filter(Boolean));

      return {
        totalViews: job?.view_count || 0,
        viewsThisWeek: weeklyViews?.length || 0,
        viewsThisMonth: monthlyViews?.length || 0,
        uniqueViewersToday: uniqueIPs.size
      };
    } catch (error) {
      logger.error('Failed to fetch job view analytics:', error);
      return {
        totalViews: 0,
        viewsThisWeek: 0,
        viewsThisMonth: 0,
        uniqueViewersToday: 0
      };
    }
  }
};
