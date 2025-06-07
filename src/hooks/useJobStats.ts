
import { useMemo } from "react";
import { Job } from "@/types";
import { getStartOfWeek } from "@/utils/dateUtils";
import { logger } from "@/services/loggerService";

export interface JobStats {
  jobsNeedingAttention: number;
  activeJobs: number;
  totalApplications: number;
  applicationsThisWeek: number;
}

export const useJobStats = (jobs: Job[], recentApplications: any[] = []) => {
  return useMemo(() => {
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = jobs.reduce((acc, job) => acc + (job.applications?.[0]?.count || 0), 0);
    const applicationsThisWeek = recentApplications.length;
    
    const jobsNeedingAttention = jobs.filter(job => 
      (job.applicationStatusCounts?.pending || 0) >= 10
    ).length;

    const stats = { jobsNeedingAttention, activeJobs, totalApplications, applicationsThisWeek };
    logger.debug('Calculated job stats:', stats);

    return stats;
  }, [jobs, recentApplications]);
};

export const useApplicationStats = (applications: any[]) => {
  return useMemo(() => {
    const pendingCount = applications.filter(app => app.status === 'pending').length;
    const approvedCount = applications.filter(app => app.status === 'approved').length;
    const rejectedCount = applications.filter(app => app.status === 'rejected').length;
    const avgRating = applications.length > 0 
      ? applications.reduce((sum, app) => sum + (app.ai_rating || 0), 0) / applications.length 
      : 0;

    const oneWeekAgo = getStartOfWeek();
    const applicationsThisWeek = applications.filter(
      app => new Date(app.created_at) >= oneWeekAgo
    ).length;

    return {
      pendingCount,
      approvedCount,
      rejectedCount,
      avgRating,
      applicationsThisWeek,
      total: applications.length
    };
  }, [applications]);
};
