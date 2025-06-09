
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
      // Get client IP address (this will be null in development but work in production)
      const ipAddress = null; // Browser can't access real IP, this will be handled by the database function
      
      const { data: result, error } = await supabase.rpc('track_job_view', {
        p_job_id: data.jobId,
        p_ip_address: ipAddress,
        p_user_agent: data.userAgent,
        p_referrer: data.referrer
      });

      if (error) {
        logger.error('Error tracking job view:', error);
        return false;
      }

      logger.debug('Job view tracked successfully:', { 
        jobId: data.jobId, 
        tracked: result 
      });
      
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
      // Get total views from jobs table
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('view_count')
        .eq('id', jobId)
        .single();

      if (jobError) {
        logger.error('Error fetching job data:', jobError);
        return {
          totalViews: 0,
          viewsThisWeek: 0,
          viewsThisMonth: 0,
          uniqueViewersToday: 0
        };
      }

      const totalViews = jobData?.view_count || 0;

      // Get detailed analytics from job_views table
      const { data: viewsData, error: viewsError } = await supabase
        .from('job_views')
        .select('viewed_at, ip_address')
        .eq('job_id', jobId)
        .order('viewed_at', { ascending: false });

      if (viewsError) {
        logger.error('Error fetching job views analytics:', viewsError);
        return {
          totalViews,
          viewsThisWeek: 0,
          viewsThisMonth: 0,
          uniqueViewersToday: 0
        };
      }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const viewsThisWeek = viewsData?.filter(view => 
        new Date(view.viewed_at) >= weekAgo
      ).length || 0;

      const viewsThisMonth = viewsData?.filter(view => 
        new Date(view.viewed_at) >= monthAgo
      ).length || 0;

      const uniqueViewersToday = new Set(
        viewsData?.filter(view => 
          new Date(view.viewed_at) >= todayStart
        ).map(view => view.ip_address).filter(Boolean)
      ).size;

      return {
        totalViews,
        viewsThisWeek,
        viewsThisMonth,
        uniqueViewersToday
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
