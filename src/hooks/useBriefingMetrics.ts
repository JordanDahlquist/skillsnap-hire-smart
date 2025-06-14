
import { useMemo } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useAllApplications } from "@/hooks/useAllApplications";
import { getStartOfDay, getStartOfWeek, isWithinTimeFrame } from "@/utils/dateUtils";

export const useBriefingMetrics = () => {
  const { data: jobs = [] } = useJobs();
  const { data: applications = [] } = useAllApplications();

  return useMemo(() => {
    const now = new Date();
    const startOfToday = getStartOfDay();
    const startOfWeek = getStartOfWeek();

    // Calculate metrics
    const needsReview = applications.filter(app => app.status === 'pending').length;
    
    const newApplicantsThisWeek = applications.filter(app => 
      isWithinTimeFrame(app.created_at, startOfWeek)
    ).length;
    
    const totalJobsActive = jobs.filter(job => job.status === 'active').length;
    
    const newApplicantsToday = applications.filter(app => 
      isWithinTimeFrame(app.created_at, startOfToday)
    ).length;

    return {
      needsReview,
      newApplicantsThisWeek,
      totalJobsActive,
      newApplicantsToday,
      isLoading: false // Since we're using existing hooks that handle loading
    };
  }, [jobs, applications]);
};
