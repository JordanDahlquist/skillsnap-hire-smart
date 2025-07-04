import { useMemo, useCallback, useState } from "react";
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
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized calculations
  const availableOptions = useMemo(() => {
    return extractAvailableOptions(jobs);
  }, [jobs]);

  // Custom sort handler that sets appropriate default sort orders
  const handleSortChange = useCallback((newSortBy: string) => {
    console.log('Sort change requested:', newSortBy);
    setSortBy(newSortBy);
    
    // Set appropriate default sort order for different sort types
    if (newSortBy === 'applications' || newSortBy === 'needs_attention' || newSortBy === 'budget') {
      setSortOrder('desc'); // High to low for numbers
    } else if (newSortBy === 'title') {
      setSortOrder('asc'); // A to Z for titles
    } else {
      setSortOrder('desc'); // Most recent first for dates
    }
  }, []);

  const filteredJobs = useMemo(() => {
    console.log('Filtering jobs:', { 
      totalJobs: jobs.length, 
      statusFilter: filters.status,
      locationTypeFilter: filters.locationType,
      searchTerm: debouncedSearchTerm,
      sortBy,
      sortOrder
    });
    
    let filtered = applyJobFiltersOptimized(jobs, debouncedSearchTerm, filters);
    
    const sortedJobs = sortJobs(filtered, sortBy, sortOrder);
    console.log('Final filtered jobs count:', sortedJobs.length);
    return sortedJobs;
  }, [jobs, debouncedSearchTerm, filters, sortBy, sortOrder]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.locationType && !filters.locationType.includes("all") && filters.locationType.length > 0) count++;
    if (filters.experienceLevel !== "all") count++;
    if (filters.employmentType !== "all") count++;
    if (filters.country !== "all") count++;
    if (filters.state !== "all") count++;
    if (filters.duration !== "all") count++;
    if (filters.status && !filters.status.includes("all") && filters.status.length > 0) count++;
    if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 200000) count++;
    return count;
  }, [filters]);

  const updateFilter = useCallback((key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilters(defaultFilters);
  }, []);

  return {
    // Data
    jobs,
    filteredJobs,
    isLoading,
    refetch,
    availableOptions,
    
    // Search and filters
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    updateFilter,
    sortBy,
    setSortBy: handleSortChange,
    sortOrder,
    setSortOrder,
    activeFiltersCount,
    clearAllFilters,
  };
};
