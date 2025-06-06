
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

// Role type synonyms for better matching
const roleTypeSynonyms: Record<string, string[]> = {
  designer: ["branding", "design", "graphic", "ui", "ux", "creative"],
  developer: ["programming", "coding", "frontend", "backend", "fullstack", "react", "javascript", "python"],
  marketer: ["marketing", "branding", "advertising", "social media", "seo"],
  analyst: ["data", "analytics", "business intelligence", "reporting"],
  writer: ["content", "copywriting", "blogging", "technical writing"],
  manager: ["project management", "product management", "team lead"]
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

  // Enhanced budget parsing with better null handling and employment-type awareness
  const parseBudget = (budgetStr: string | null, employmentType: string = 'project'): number => {
    if (!budgetStr || budgetStr.trim() === '') return 0;
    
    const cleanBudget = budgetStr.replace(/[^\d.,kK]/g, '');
    
    if (cleanBudget.includes('k') || cleanBudget.includes('K')) {
      return parseFloat(cleanBudget.replace(/[kK]/g, '')) * 1000;
    }
    
    const amount = parseFloat(cleanBudget.replace(/,/g, '')) || 0;
    
    // Handle hourly rates for full-time/part-time positions
    if ((employmentType === 'full-time' || employmentType === 'part-time') && amount < 1000) {
      // Assume it's an hourly rate, convert to annual (assuming 2000 hours/year for full-time)
      const hoursPerYear = employmentType === 'full-time' ? 2000 : 1000;
      return amount * hoursPerYear;
    }
    
    return amount;
  };

  // Enhanced search function with better partial matching
  const matchesSearchTerm = (job: any, searchTerm: string): boolean => {
    if (!searchTerm || searchTerm.trim() === "") return true;
    
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const searchWords = normalizedSearchTerm.split(/\s+/).filter(word => word.length > 0);
    
    const searchableContent = [
      job.title || '',
      job.description || '',
      job.required_skills || '',
      job.role_type || ''
    ].join(' ').toLowerCase();
    
    return searchWords.every(word => {
      if (searchableContent.includes(word)) return true;
      
      if (word.length > 2) {
        const contentWords = searchableContent.split(/\s+/);
        return contentWords.some(jobWord => {
          return jobWord.includes(word) || 
                 word.includes(jobWord) ||
                 (jobWord.length > 3 && word.length > 3 && 
                  (jobWord.startsWith(word.substring(0, 4)) || word.startsWith(jobWord.substring(0, 4))));
        });
      }
      
      return false;
    });
  };

  // Enhanced role matching with synonyms
  const findBestRoleMatch = (value: string, availableValues: string[]): string => {
    if (!value || value === "all") return "all";
    
    const normalizedValue = value.toLowerCase();
    
    // Exact match first
    const exactMatch = availableValues.find(av => av.toLowerCase() === normalizedValue);
    if (exactMatch) return exactMatch;
    
    // Partial match
    const partialMatch = availableValues.find(av => 
      av.toLowerCase().includes(normalizedValue) || 
      normalizedValue.includes(av.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    // Synonym matching
    for (const [roleType, synonyms] of Object.entries(roleTypeSynonyms)) {
      if (synonyms.some(synonym => normalizedValue.includes(synonym) || synonym.includes(normalizedValue))) {
        const matchingRole = availableValues.find(av => av.toLowerCase().includes(roleType));
        if (matchingRole) return matchingRole;
      }
    }
    
    return "all";
  };

  // Smart filter matching with fallbacks
  const findBestMatch = (value: string, availableValues: string[]): string => {
    if (!value || value === "all") return "all";
    
    // Exact match first
    const exactMatch = availableValues.find(av => av.toLowerCase() === value.toLowerCase());
    if (exactMatch) return exactMatch;
    
    // Partial match
    const partialMatch = availableValues.find(av => 
      av.toLowerCase().includes(value.toLowerCase()) || 
      value.toLowerCase().includes(av.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    return "all";
  };

  // Filter jobs with enhanced debugging and employment-type-aware budget filtering
  const filteredJobs = useMemo(() => {
    console.log('Filtering jobs with:', { searchTerm, filters, totalJobs: jobs.length });
    
    let filtered = jobs.filter(job => {
      // Enhanced text search
      const matchesSearch = matchesSearchTerm(job, searchTerm);
      
      // Filter checks with debugging
      const matchesRoleType = filters.roleType === "all" || job.role_type === filters.roleType;
      const matchesLocationType = filters.locationType === "all" || job.location_type === filters.locationType;
      const matchesExperienceLevel = filters.experienceLevel === "all" || job.experience_level === filters.experienceLevel;
      const matchesEmploymentType = filters.employmentType === "all" || job.employment_type === filters.employmentType;
      const matchesCountry = filters.country === "all" || job.country === filters.country;
      const matchesState = filters.state === "all" || job.state === filters.state;
      const matchesDuration = filters.duration === "all" || job.duration === filters.duration;
      
      // Enhanced budget range check with employment-type awareness
      const jobBudget = parseBudget(job.budget, job.employment_type);
      const [minBudget, maxBudget] = filters.budgetRange;
      const matchesBudget = jobBudget >= minBudget && (maxBudget >= 200000 || jobBudget <= maxBudget);
      
      // Debug logging for jobs that fail filters
      if (!matchesSearch || !matchesRoleType || !matchesLocationType || 
          !matchesExperienceLevel || !matchesEmploymentType || !matchesCountry || 
          !matchesState || !matchesDuration || !matchesBudget) {
        console.log(`Job "${job.title}" filtered out:`, {
          matchesSearch,
          matchesRoleType: `${matchesRoleType} (${job.role_type} vs ${filters.roleType})`,
          matchesLocationType: `${matchesLocationType} (${job.location_type} vs ${filters.locationType})`,
          matchesExperienceLevel: `${matchesExperienceLevel} (${job.experience_level} vs ${filters.experienceLevel})`,
          matchesEmploymentType: `${matchesEmploymentType} (${job.employment_type} vs ${filters.employmentType})`,
          matchesCountry: `${matchesCountry} (${job.country} vs ${filters.country})`,
          matchesState: `${matchesState} (${job.state} vs ${filters.state})`,
          matchesDuration: `${matchesDuration} (${job.duration} vs ${filters.duration})`,
          matchesBudget: `${matchesBudget} (${jobBudget} in range [${minBudget}, ${maxBudget}])`,
          jobBudgetRaw: job.budget,
          jobEmploymentType: job.employment_type
        });
      }
      
      return matchesSearch && matchesRoleType && matchesLocationType && 
             matchesExperienceLevel && matchesEmploymentType && matchesCountry && 
             matchesState && matchesDuration && matchesBudget;
    });

    console.log(`Filtered results: ${filtered.length} out of ${jobs.length} jobs`);
    
    // If no results with filters, fall back to text search only
    if (filtered.length === 0 && searchTerm && (
      filters.roleType !== "all" || filters.locationType !== "all" || 
      filters.experienceLevel !== "all" || filters.employmentType !== "all" ||
      filters.country !== "all" || filters.state !== "all" || filters.duration !== "all" ||
      filters.budgetRange[0] > 0 || filters.budgetRange[1] < 200000
    )) {
      console.log('No results with filters, falling back to text search only');
      filtered = jobs.filter(job => matchesSearchTerm(job, searchTerm));
    }

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "budget":
          aValue = parseBudget(a.budget, a.employment_type);
          bValue = parseBudget(b.budget, b.employment_type);
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

  // Enhanced AI search apply function
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
    
    // Apply smart matching for filters
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
