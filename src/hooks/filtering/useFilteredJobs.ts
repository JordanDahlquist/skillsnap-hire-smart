
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
    console.log('useFilteredJobs - Starting filter process:', {
      totalJobs: jobs.length,
      activeJobsFilter,
      needsAttentionFilter
    });
    
    let filtered = applyJobFilters(jobs, searchTerm, filters);
    
    if (needsAttentionFilter) {
      filtered = filtered.filter(job => 
        (job.applicationStatusCounts?.pending || 0) >= 10
      );
      console.log('After needs attention filter:', filtered.length);
    }
    
    if (activeJobsFilter) {
      console.log('Job statuses before active filter:', jobs.map(job => ({ id: job.id, status: job.status })));
      filtered = filtered.filter(job => {
        // Check for various possible active status values
        const isActive = job.status === 'active' || job.status === 'published' || job.status === 'open';
        return isActive;
      });
      console.log('After active jobs filter:', filtered.length);
    }
    
    const result = sortJobs(filtered, sortBy, sortOrder);
    console.log('Final filtered result count:', result.length);
    return result;
  }, [jobs, searchTerm, filters, sortBy, sortOrder, needsAttentionFilter, activeJobsFilter]);
};
