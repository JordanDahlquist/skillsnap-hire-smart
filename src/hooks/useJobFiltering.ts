
import { useMemo } from "react";
import { JobFilters } from "./job-filtering/types";
import { findBestMatch } from "./job-filtering/jobMatching";
import { extractAvailableOptions } from "./job-filtering/availableOptions";
import { useSearchFilter } from "./filtering/useSearchFilter";
import { useJobFilters } from "./filtering/useJobFilters";
import { useJobSorting } from "./filtering/useJobSorting";
import { useSpecialFilters } from "./filtering/useSpecialFilters";
import { useFilteredJobs } from "./filtering/useFilteredJobs";

export type { JobFilters } from "./job-filtering/types";

export const useJobFiltering = (jobs: any[]) => {
  const { searchTerm, setSearchTerm, clearSearch } = useSearchFilter();
  const { filters, setFilters, updateFilter, clearFilters } = useJobFilters();
  const { sortBy, setSortBy, sortOrder, setSortOrder } = useJobSorting();
  const { 
    needsAttentionFilter, 
    setNeedsAttentionFilter, 
    activeJobsFilter, 
    setActiveJobsFilter,
    clearSpecialFilters 
  } = useSpecialFilters();

  const availableOptions = useMemo(() => {
    return extractAvailableOptions(jobs);
  }, [jobs]);

  const filteredJobs = useFilteredJobs(
    jobs, 
    searchTerm, 
    filters, 
    sortBy, 
    sortOrder, 
    needsAttentionFilter, 
    activeJobsFilter
  );

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

  const clearAllFilters = () => {
    clearSearch();
    clearFilters();
    clearSpecialFilters();
  };

  const applyAiSearchResults = (aiSearchTerm: string, aiFilters: JobFilters) => {
    clearAllFilters();
    
    let budgetRange = aiFilters.budgetRange || [0, 200000];
    if (budgetRange[0] === 0 && budgetRange[1] === 0) {
      budgetRange = [0, 200000];
    }
    
    const smartFilters: JobFilters = {
      locationType: findBestMatch(aiFilters.locationType, availableOptions.locationTypes),
      experienceLevel: findBestMatch(aiFilters.experienceLevel, availableOptions.experienceLevels),
      employmentType: findBestMatch(aiFilters.employmentType, availableOptions.employmentTypes),
      country: findBestMatch(aiFilters.country, availableOptions.countries),
      state: findBestMatch(aiFilters.state, availableOptions.states),
      duration: findBestMatch(aiFilters.duration, availableOptions.durations),
      budgetRange
    };
    
    setSearchTerm(aiSearchTerm);
    setFilters(smartFilters);
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    updateFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredJobs,
    availableOptions,
    activeFiltersCount,
    clearFilters: clearAllFilters,
    applyAiSearchResults,
    needsAttentionFilter,
    setNeedsAttentionFilter,
    activeJobsFilter,
    setActiveJobsFilter
  };
};
