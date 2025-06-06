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

// Enhanced role type synonyms for better flexible matching
const roleTypeSynonyms: Record<string, string[]> = {
  designer: ["branding", "design", "graphic", "ui", "ux", "creative", "visual", "art"],
  developer: ["programming", "coding", "frontend", "backend", "fullstack", "react", "javascript", "python", "software", "web", "app"],
  marketer: ["marketing", "branding", "advertising", "social media", "seo", "digital marketing", "growth"],
  analyst: ["data", "analytics", "business intelligence", "reporting", "research", "insights"],
  writer: ["content", "copywriting", "blogging", "technical writing", "journalism", "editing"],
  manager: ["project management", "product management", "team lead", "coordinator", "director"],
  consultant: ["consulting", "strategy", "advisory", "expert", "specialist"],
  sales: ["sales", "business development", "account management", "customer success"]
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

  // Enhanced flexible search function with better partial matching
  const matchesSearchTerm = (job: any, searchTerm: string): boolean => {
    if (!searchTerm || searchTerm.trim() === "") return true;
    
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const searchWords = normalizedSearchTerm.split(/\s+/).filter(word => word.length > 0);
    
    const searchableContent = [
      job.title || '',
      job.description || '',
      job.required_skills || '',
      job.role_type || '',
      job.city || '',
      job.state || '',
      job.country || ''
    ].join(' ').toLowerCase();
    
    // More flexible matching - require at least 60% of search words to match
    const matchedWords = searchWords.filter(word => {
      if (searchableContent.includes(word)) return true;
      
      // Partial word matching for words longer than 3 characters
      if (word.length > 3) {
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
    
    // Require at least 60% match, but at least 1 word for short searches
    const requiredMatches = Math.max(1, Math.ceil(searchWords.length * 0.6));
    return matchedWords.length >= requiredMatches;
  };

  // Enhanced role matching with better synonym support
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
    
    // Enhanced synonym matching
    for (const [roleType, synonyms] of Object.entries(roleTypeSynonyms)) {
      if (synonyms.some(synonym => normalizedValue.includes(synonym) || synonym.includes(normalizedValue))) {
        const matchingRole = availableValues.find(av => av.toLowerCase().includes(roleType));
        if (matchingRole) return matchingRole;
      }
    }
    
    // If no match found, prefer "all" for flexibility
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

  // Enhanced filtering with flexible matching and fallback logic
  const filteredJobs = useMemo(() => {
    console.log('Filtering jobs with:', { searchTerm, filters, totalJobs: jobs.length });
    
    let filtered = jobs.filter(job => {
      // Enhanced text search with more weight
      const matchesSearch = matchesSearchTerm(job, searchTerm);
      
      // Flexible filter checks
      const matchesRoleType = filters.roleType === "all" || job.role_type === filters.roleType;
      const matchesLocationType = filters.locationType === "all" || job.location_type === filters.locationType;
      const matchesExperienceLevel = filters.experienceLevel === "all" || job.experience_level === filters.experienceLevel;
      const matchesEmploymentType = filters.employmentType === "all" || job.employment_type === filters.employmentType;
      const matchesCountry = filters.country === "all" || job.country === filters.country;
      const matchesState = filters.state === "all" || job.state === filters.state;
      const matchesDuration = filters.duration === "all" || job.duration === filters.duration;
      
      // More flexible budget matching
      const jobBudget = parseBudget(job.budget, job.employment_type);
      const [minBudget, maxBudget] = filters.budgetRange;
      // Include jobs with no budget if budget filter is at default
      const matchesBudget = (minBudget === 0 && maxBudget >= 200000) || 
                           (jobBudget === 0) || // Include jobs without budget data
                           (jobBudget >= minBudget && (maxBudget >= 200000 || jobBudget <= maxBudget));
      
      return matchesSearch && matchesRoleType && matchesLocationType && 
             matchesExperienceLevel && matchesEmploymentType && matchesCountry && 
             matchesState && matchesDuration && matchesBudget;
    });

    console.log(`Initial filtered results: ${filtered.length} out of ${jobs.length} jobs`);
    
    // Enhanced fallback logic - if too few results, progressively relax filters
    if (filtered.length < 5 && searchTerm && (
      filters.roleType !== "all" || filters.locationType !== "all" || 
      filters.experienceLevel !== "all" || filters.employmentType !== "all" ||
      filters.country !== "all" || filters.state !== "all" || filters.duration !== "all" ||
      filters.budgetRange[0] > 0 || filters.budgetRange[1] < 200000
    )) {
      console.log('Too few results, applying fallback with relaxed filters');
      
      // First fallback: Remove budget and duration constraints
      let relaxedFiltered = jobs.filter(job => {
        const matchesSearch = matchesSearchTerm(job, searchTerm);
        const matchesRoleType = filters.roleType === "all" || job.role_type === filters.roleType;
        const matchesLocationType = filters.locationType === "all" || job.location_type === filters.locationType;
        const matchesExperienceLevel = filters.experienceLevel === "all" || job.experience_level === filters.experienceLevel;
        const matchesEmploymentType = filters.employmentType === "all" || job.employment_type === filters.employmentType;
        const matchesCountry = filters.country === "all" || job.country === filters.country;
        const matchesState = filters.state === "all" || job.state === filters.state;
        
        return matchesSearch && matchesRoleType && matchesLocationType && 
               matchesExperienceLevel && matchesEmploymentType && matchesCountry && matchesState;
      });

      if (relaxedFiltered.length > filtered.length) {
        filtered = relaxedFiltered;
        console.log(`Relaxed filtering (removed budget/duration): ${filtered.length} jobs`);
      }
      
      // Second fallback: Keep only essential filters (role, employment type) + text search
      if (filtered.length < 3) {
        relaxedFiltered = jobs.filter(job => {
          const matchesSearch = matchesSearchTerm(job, searchTerm);
          const matchesRoleType = filters.roleType === "all" || job.role_type === filters.roleType;
          const matchesEmploymentType = filters.employmentType === "all" || job.employment_type === filters.employmentType;
          
          return matchesSearch && matchesRoleType && matchesEmploymentType;
        });
        
        if (relaxedFiltered.length > filtered.length) {
          filtered = relaxedFiltered;
          console.log(`Highly relaxed filtering (role + employment + search): ${filtered.length} jobs`);
        }
      }
      
      // Final fallback: Text search only
      if (filtered.length < 2) {
        relaxedFiltered = jobs.filter(job => matchesSearchTerm(job, searchTerm));
        if (relaxedFiltered.length > filtered.length) {
          filtered = relaxedFiltered;
          console.log(`Text search only fallback: ${filtered.length} jobs`);
        }
      }
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
