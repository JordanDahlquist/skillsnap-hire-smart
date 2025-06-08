
import { useMemo, useCallback, useState } from "react";
import { useJobs } from "./useJobs";
import { useRecentApplications } from "./useApplications";
import { useJobStats } from "./useJobStats";
import { JobFilters, defaultFilters } from "./job-filtering/types";
import { extractAvailableOptions } from "./job-filtering/availableOptions";
import { applyJobFiltersOptimized, sortJobs } from "./job-filtering/optimizedFilterUtils";
import { useDebounce } from "./useDebounce";
import { logger } from "@/services/loggerService";

export const useJobsData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);
  const [activeJobsFilter, setActiveJobsFilter] = useState(false);

  // Debounce search to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Data fetching
  const { data: jobs = [], isLoading, refetch } = useJobs();
  const { data: recentApplications = [] } = useRecentApplications(jobs.map(job => job.id));

  // Memoized calculations
  const availableOptions = useMemo(() => {
    return extractAvailableOptions(jobs);
  }, [jobs]);

  const stats = useJobStats(jobs, recentApplications);

  const filteredJobs = useMemo(() => {
    logger.debug('Filtering jobs with optimized logic');
    
    let filtered = applyJobFiltersOptimized(jobs, debouncedSearchTerm, filters);
    
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
