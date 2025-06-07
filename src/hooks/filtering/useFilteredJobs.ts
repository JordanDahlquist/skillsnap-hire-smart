
import { useMemo } from "react";
import { JobFilters } from "../job-filtering/types";
import { applyJobFilters, sortJobs } from "../job-filtering/filterUtils";

export const useFilteredJobs = (
  jobs: any[],
  searchTerm: string,
  filters: JobFilters,
  sortBy: string,
  sortOrder: "asc" | "desc",
  needsAttentionFilter: boolean,
  activeJobsFilter: boolean
) => {
  return useMemo(() => {
    let filtered = applyJobFilters(jobs, searchTerm, filters);
    
    if (needsAttentionFilter) {
      filtered = filtered.filter(job => 
        (job.applicationStatusCounts?.pending || 0) >= 10
      );
    }
    
    if (activeJobsFilter) {
      filtered = filtered.filter(job => 
        job.status === 'active'
      );
    }
    
    return sortJobs(filtered, sortBy, sortOrder);
  }, [jobs, searchTerm, filters, sortBy, sortOrder, needsAttentionFilter, activeJobsFilter]);
};
