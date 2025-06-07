
import { useState, useMemo } from "react";
import { JobFilters, defaultFilters } from "./job-filtering/types";
import { findBestRoleMatch, findBestMatch } from "./job-filtering/jobMatching";
import { applyJobFilters, sortJobs } from "./job-filtering/filterUtils";
import { extractAvailableOptions } from "./job-filtering/availableOptions";

export type { JobFilters } from "./job-filtering/types";

export const useJobFiltering = (jobs: any[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Extract available options from jobs data
  const availableOptions = useMemo(() => {
    return extractAvailableOptions(jobs);
  }, [jobs]);

  // Enhanced filtering with flexible matching and fallback logic
  const filteredJobs = useMemo(() => {
    const filtered = applyJobFilters(jobs, searchTerm, filters);
    return sortJobs(filtered, sortBy, sortOrder);
  }, [jobs, searchTerm, filters, sortBy, sortOrder]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.roleType !== "all") count++;
    if (filters.locationType !== "all") count++;
    if (filters.experienceLevel !== "all") count++;
    if (filters.employmentType !== "all") count++;
    if (filters.country !== "all") count++;
    if (filters.state !== "all") count++;
    if (filters.duration !== "all") count++;
    if (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 200000) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilters(defaultFilters);
  };

  // Enhanced AI search apply function with flexible matching
  const applyAiSearchResults = (aiSearchTerm: string, aiFilters: JobFilters) => {
    console.log("AI Search Results:", { aiSearchTerm, aiFilters });
    console.log("Available Options:", availableOptions);
    
    // Clear existing filters first
    setFilters(defaultFilters);
    setSearchTerm("");
    
    // Fix budget range if AI returned [0, 0]
    let budgetRange = aiFilters.budgetRange || [0, 200000];
    if (budgetRange[0] === 0 && budgetRange[1] === 0) {
      budgetRange = [0, 200000];
      console.log("Fixed budget range from [0, 0] to [0, 200000]");
    }
    
    // Apply smart matching for filters with enhanced flexibility
    const smartFilters: JobFilters = {
      roleType: findBestRoleMatch(aiFilters.roleType, availableOptions.roleTypes),
      locationType: findBestMatch(aiFilters.locationType, availableOptions.locationTypes),
      experienceLevel: findBestMatch(aiFilters.experienceLevel, availableOptions.experienceLevels),
      employmentType: findBestMatch(aiFilters.employmentType, availableOptions.employmentTypes),
      country: findBestMatch(aiFilters.country, availableOptions.countries),
      state: findBestMatch(aiFilters.state, availableOptions.states),
      duration: findBestMatch(aiFilters.duration, availableOptions.durations),
      budgetRange
    };
    
    console.log("Smart Filters Applied:", smartFilters);
    
    // Set the search term and filters
    setSearchTerm(aiSearchTerm);
    setFilters(smartFilters);
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredJobs,
    availableOptions,
    activeFiltersCount,
    clearFilters,
    applyAiSearchResults
  };
};
