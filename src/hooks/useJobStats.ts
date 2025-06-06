
import { useMemo } from "react";
import { Job } from "@/hooks/useJobs";
import { getStartOfWeek } from "@/utils/dateUtils";

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationsThisWeek: number;
}

export const useJobStats = (jobs: Job[], recentApplications: any[] = []) => {
  return useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = jobs.reduce((acc, job) => acc + (job.applications?.[0]?.count || 0), 0);
    const applicationsThisWeek = recentApplications.length;

    console.log('Calculated stats:', { totalJobs, activeJobs, totalApplications, applicationsThisWeek });

    return { totalJobs, activeJobs, totalApplications, applicationsThisWeek };
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
