
import { useState, useMemo } from "react";

export interface JobFilters {
  roleType: string;
  locationType: string;
  experienceLevel: string;
  employmentType: string;
  country: string;
  state: string;
  budgetRange: number[];
  duration: string;
}

const defaultFilters: JobFilters = {
  roleType: "all",
  locationType: "all",
  experienceLevel: "all",
  employmentType: "all",
  country: "all",
  state: "all",
  budgetRange: [0, 200000],
  duration: "all"
};

export const useJobFiltering = (jobs: any[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Extract available options from jobs data
  const availableOptions = useMemo(() => {
    const roleTypes = [...new Set(jobs.map(job => job.role_type).filter(Boolean))];
    const locationTypes = [...new Set(jobs.map(job => job.location_type).filter(Boolean))];
    const experienceLevels = [...new Set(jobs.map(job => job.experience_level).filter(Boolean))];
    const employmentTypes = [...new Set(jobs.map(job => job.employment_type).filter(Boolean))];
    const countries = [...new Set(jobs.map(job => job.country).filter(Boolean))];
    const states = [...new Set(jobs.map(job => job.state).filter(Boolean))];
    const durations = [...new Set(jobs.map(job => job.duration).filter(Boolean))];

    return {
      roleTypes,
      locationTypes,
      experienceLevels,
      employmentTypes,
      countries,
      states,
      durations
    };
  }, [jobs]);

  // Parse budget string to number for comparison
  const parseBudget = (budgetStr: string | null): number => {
    if (!budgetStr) return 0;
    
    // Remove non-numeric characters except dots and commas
    const cleanBudget = budgetStr.replace(/[^\d.,]/g, '');
    
    // Handle different formats like "50,000", "50.000", "50k", etc.
    if (cleanBudget.includes('k') || cleanBudget.includes('K')) {
      return parseFloat(cleanBudget.replace(/[kK]/g, '')) * 1000;
    }
    
    return parseFloat(cleanBudget.replace(/,/g, '')) || 0;
  };

  // Filter jobs based on search term and filters
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      // Text search
      const matchesSearch = searchTerm === "" || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.required_skills && job.required_skills.toLowerCase().includes(searchTerm.toLowerCase()));
        
      // Filter checks
      const matchesRoleType = filters.roleType === "all" || job.role_type === filters.roleType;
      const matchesLocationType = filters.locationType === "all" || job.location_type === filters.locationType;
      const matchesExperienceLevel = filters.experienceLevel === "all" || job.experience_level === filters.experienceLevel;
      const matchesEmploymentType = filters.employmentType === "all" || job.employment_type === filters.employmentType;
      const matchesCountry = filters.country === "all" || job.country === filters.country;
      const matchesState = filters.state === "all" || job.state === filters.state;
      const matchesDuration = filters.duration === "all" || job.duration === filters.duration;
      
      // Budget range check
      const jobBudget = parseBudget(job.budget);
      const matchesBudget = jobBudget >= filters.budgetRange[0] && jobBudget <= filters.budgetRange[1];
      
      return matchesSearch && matchesRoleType && matchesLocationType && 
             matchesExperienceLevel && matchesEmploymentType && matchesCountry && 
             matchesState && matchesDuration && matchesBudget;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "budget":
          aValue = parseBudget(a.budget);
          bValue = parseBudget(b.budget);
          break;
        case "applications":
          aValue = a.applications?.[0]?.count || 0;
          bValue = b.applications?.[0]?.count || 0;
          break;
        case "created_at":
        case "updated_at":
          aValue = new Date(a[sortBy]).getTime();
          bValue = new Date(b[sortBy]).getTime();
          break;
        default:
          aValue = a[sortBy] || "";
          bValue = b[sortBy] || "";
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
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
    clearFilters
  };
};
