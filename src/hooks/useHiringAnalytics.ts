
import { useMemo, useState } from "react";
import { useJobs } from "./useJobs";
import { useAllApplications } from "./useAllApplications";
import { getStartOfWeek, getStartOfMonth } from "@/utils/dateUtils";
import { logger } from "@/services/loggerService";

export interface HiringMetrics {
  totalJobs: number;
  totalApplications: number;
  hiredRate: number;
  avgRating: number;
  applicationsThisWeek: number;
  applicationsThisMonth: number;
  topPerformingJob: string | null;
  conversionRate: number;
  avgTimeToResponse: number;
}

export interface PipelineData {
  pending: number;
  approved: number;
  rejected: number;
  totalApplications: number;
}

export interface TrendData {
  date: string;
  applications: number;
  avgRating: number;
  hired: number;
}

export interface JobPerformance {
  jobId: string;
  jobTitle: string;
  applications: number;
  hiredRate: number;
  avgRating: number;
  responseTime: number;
}

export const useHiringAnalytics = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useJobs();
  const { data: allApplications = [], isLoading: applicationsLoading, refetch: refetchApplications } = useAllApplications();

  // Memoize basic calculations
  const basicStats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplications = allApplications.length;
    // Changed from 'approved' to 'hired' status
    const hiredApps = allApplications.filter(app => app.status === 'hired');
    const hiredRate = totalApplications > 0 ? (hiredApps.length / totalApplications) * 100 : 0;
    
    const ratingsSum = allApplications.reduce((sum, app) => sum + (app.ai_rating || 0), 0);
    const avgRating = totalApplications > 0 ? ratingsSum / totalApplications : 0;

    logger.debug('Basic stats calculated', { totalJobs, totalApplications, hiredRate, avgRating });

    return { totalJobs, totalApplications, hiredRate, avgRating, hiredCount: hiredApps.length };
  }, [jobs.length, allApplications]);

  // Memoize time-based calculations
  const timeBasedStats = useMemo(() => {
    const oneWeekAgo = getStartOfWeek();
    const oneMonthAgo = getStartOfMonth();
    
    const applicationsThisWeek = allApplications.filter(
      app => new Date(app.created_at) >= oneWeekAgo
    ).length;
    
    const applicationsThisMonth = allApplications.filter(
      app => new Date(app.created_at) >= oneMonthAgo
    ).length;

    logger.debug('Time-based stats calculated', { applicationsThisWeek, applicationsThisMonth });

    return { applicationsThisWeek, applicationsThisMonth };
  }, [allApplications]);

  // Memoize job performance calculations
  const jobPerformanceStats = useMemo(() => {
    const jobPerformance = jobs.map(job => {
      const jobApps = allApplications.filter(app => app.job_id === job.id);
      const jobHired = jobApps.filter(app => app.status === 'hired').length;
      const jobHiredRate = jobApps.length >= 5 ? (jobHired / jobApps.length) * 100 : 0;
      return { job, hiredRate: jobHiredRate, applications: jobApps.length };
    });

    const topJob = jobPerformance
      .filter(jp => jp.applications >= 5)
      .sort((a, b) => b.hiredRate - a.hiredRate)[0];

    const topPerformingJob = topJob?.job.title || null;

    logger.debug('Job performance stats calculated', { topPerformingJob, jobCount: jobPerformance.length });

    return { topPerformingJob, jobPerformance };
  }, [jobs, allApplications]);

  const metrics = useMemo((): HiringMetrics => {
    return {
      ...basicStats,
      ...timeBasedStats,
      topPerformingJob: jobPerformanceStats.topPerformingJob,
      conversionRate: basicStats.hiredRate,
      avgTimeToResponse: 2.5 // Mock data - would need actual response time tracking
    };
  }, [basicStats, timeBasedStats, jobPerformanceStats.topPerformingJob]);

  const pipelineData = useMemo((): PipelineData => {
    const pending = allApplications.filter(app => app.status === 'pending').length;
    const approved = allApplications.filter(app => app.status === 'approved').length;
    const rejected = allApplications.filter(app => app.status === 'rejected').length;
    
    return {
      pending,
      approved,
      rejected,
      totalApplications: allApplications.length
    };
  }, [allApplications]);

  const trendData = useMemo((): TrendData[] => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    return last30Days.map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayApplications = allApplications.filter(app => {
        const appDate = new Date(app.created_at);
        return appDate >= dayStart && appDate <= dayEnd;
      });

      const avgRating = dayApplications.length > 0 
        ? dayApplications.reduce((sum, app) => sum + (app.ai_rating || 0), 0) / dayApplications.length
        : 0;

      const hired = dayApplications.filter(app => app.status === 'hired').length;

      return {
        date: date.toISOString().split('T')[0],
        applications: dayApplications.length,
        avgRating,
        hired
      };
    });
  }, [allApplications]);

  const jobPerformanceData = useMemo((): JobPerformance[] => {
    return jobs.map(job => {
      const jobApps = allApplications.filter(app => app.job_id === job.id);
      const hired = jobApps.filter(app => app.status === 'hired').length;
      const hiredRate = jobApps.length > 0 ? (hired / jobApps.length) * 100 : 0;
      
      const ratings = jobApps.filter(app => app.ai_rating).map(app => app.ai_rating!);
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

      return {
        jobId: job.id,
        jobTitle: job.title,
        applications: jobApps.length,
        hiredRate,
        avgRating,
        responseTime: Math.random() * 5 + 1 // Mock data - would need actual tracking
      };
    }).sort((a, b) => b.applications - a.applications);
  }, [jobs, allApplications]);

  const refreshAnalytics = async () => {
    setIsRefreshing(true);
    try {
      logger.info('Refreshing analytics data');
      await Promise.all([
        refetchJobs(),
        refetchApplications()
      ]);
      logger.info('Analytics data refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh analytics data', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    metrics,
    pipelineData,
    trendData,
    jobPerformanceData,
    isLoading: jobsLoading || applicationsLoading,
    isRefreshing,
    refreshAnalytics
  };
};
