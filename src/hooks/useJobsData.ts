
import { useMemo, useCallback, useState } from "react";
import { useRecentApplications } from "./useApplications";
import { useJobStats } from "./useJobStats";
import { JobFilters, defaultFilters } from "./job-filtering/types";
import { extractAvailableOptions } from "./job-filtering/availableOptions";
import { applyJobFiltersOptimized, sortJobs } from "./job-filtering/optimizedFilterUtils";
import { useDebounce } from "./useDebounce";
import { Job } from "@/types";

interface UseJobsDataProps {
  jobs: Job[];
  isLoading?: boolean;
  refetch?: () => void;
}

export const useJobsData = ({ jobs, isLoading = false, refetch }: UseJobsDataProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);
  const [activeJobsFilter, setActiveJobsFilter] = useState(false);

  // Debounce search to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Data fetching with the provided jobs
  const { data: recentApplications = [] } = useRecentApplications(jobs.map(job => job.id));

  // Memoized calculations
  const availableOptions = useMemo(() => {
    return extractAvailableOptions(jobs);
  }, [jobs]);

  const stats = useJobStats(jobs, recentApplications);

  const filteredJobs = useMemo(() => {
    console.log('Filtering jobs:', { 
      totalJobs: jobs.length, 
      activeJobsFilter, 
      needsAttentionFilter,
      searchTerm: debouncedSearchTerm 
    });
    
    let filtered = applyJobFiltersOptimized(jobs, debouncedSearchTerm, filters);
    
    if (needsAttentionFilter) {
      filtered = filtered.filter(job => {
        const pendingCount = job.applicationStatusCounts?.pending || 0;
        return pendingCount >= 10;
      });
    }
    
    if (activeJobsFilter) {
      console.log('Applying active jobs filter. Job statuses:', jobs.map(job => ({ id: job.id, status: job.status })));
      filtered = filtered.filter(job => {
        // Check for various possible active status values
        const isActive = job.status === 'active' || job.status === 'published' || job.status === 'open';
        console.log(`Job ${job.id} status: ${job.status}, isActive: ${isActive}`);
        return isActive;
      });
      console.log('Filtered active jobs:', filtered.length);
    }
    
    const sortedJobs = sortJobs(filtered, sortBy, sortOrder);
    console.log('Final filtered jobs count:', sortedJobs.length);
    return sortedJobs;
  }, [jobs, debouncedSearchTerm, filters, sortBy, sortOrder, needsAttentionFilter, activeJobsFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.locationType !== "all") count++;
    if (filters.experienceLevel !== "all") count++;
    if (filters.employmentType !== "all") count++;
    if (filters.country !== "all") count++;
    if (filters.state !== "all") count++;
    if (filters.duration !== "all") count++;
    if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 200000) count++;
    if (needsAttentionFilter) count++;
    if (activeJobsFilter) count++;
    return count;
  }, [filters, needsAttentionFilter, activeJobsFilter]);

  const updateFilter = useCallback((key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilters(defaultFilters);
    setNeedsAttentionFilter(false);
    setActiveJobsFilter(false);
  }, []);

  return {
    // Data
    jobs,
    filteredJobs,
    isLoading,
    refetch,
    stats,
    availableOptions,
    
    // Search and filters
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    updateFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    needsAttentionFilter,
    setNeedsAttentionFilter,
    activeJobsFilter,
    setActiveJobsFilter,
    activeFiltersCount,
    clearAllFilters,
  };
};
