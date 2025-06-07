import { JobFilters } from "./types";
import { matchesSearchTerm } from "./jobMatching";

// Enhanced budget parsing with better null handling and employment-type awareness
export const parseBudget = (budgetStr: string | null, employmentType: string = 'project'): number => {
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

// Enhanced filtering with flexible matching and fallback logic
export const applyJobFilters = (jobs: any[], searchTerm: string, filters: JobFilters) => {
  console.log('Filtering jobs with:', { searchTerm, filters, totalJobs: jobs.length });
  
  let filtered = jobs.filter(job => {
    // Enhanced text search with more weight
    const matchesSearch = matchesSearchTerm(job, searchTerm);
    
    // Use employment_type preferentially, fall back to role_type for backward compatibility
    const jobEmploymentType = job.employment_type || job.role_type;
    
    // Flexible filter checks
    const matchesEmploymentType = filters.employmentType === "all" || jobEmploymentType === filters.employmentType;
    const matchesLocationType = filters.locationType === "all" || job.location_type === filters.locationType;
    const matchesExperienceLevel = filters.experienceLevel === "all" || job.experience_level === filters.experienceLevel;
    const matchesCountry = filters.country === "all" || job.country === filters.country;
    const matchesState = filters.state === "all" || job.state === filters.state;
    const matchesDuration = filters.duration === "all" || job.duration === filters.duration;
    
    // More flexible budget matching
    const jobBudget = parseBudget(job.budget, jobEmploymentType);
    const [minBudget, maxBudget] = filters.budgetRange;
    // Include jobs with no budget if budget filter is at default
    const matchesBudget = (minBudget === 0 && maxBudget >= 200000) || 
                         (jobBudget === 0) || // Include jobs without budget data
                         (jobBudget >= minBudget && (maxBudget >= 200000 || jobBudget <= maxBudget));
    
    return matchesSearch && matchesEmploymentType && matchesLocationType && 
           matchesExperienceLevel && matchesCountry && 
           matchesState && matchesDuration && matchesBudget;
  });

  console.log(`Initial filtered results: ${filtered.length} out of ${jobs.length} jobs`);
  
  // Enhanced fallback logic - if too few results, progressively relax filters
  if (filtered.length < 5 && searchTerm && (
    filters.employmentType !== "all" || filters.locationType !== "all" || 
    filters.experienceLevel !== "all" || filters.country !== "all" || 
    filters.state !== "all" || filters.duration !== "all" ||
    filters.budgetRange[0] > 0 || filters.budgetRange[1] < 200000
  )) {
    console.log('Too few results, applying fallback with relaxed filters');
    
    // First fallback: Remove budget and duration constraints
    let relaxedFiltered = jobs.filter(job => {
      const matchesSearch = matchesSearchTerm(job, searchTerm);
      const jobEmploymentType = job.employment_type || job.role_type;
      const matchesEmploymentType = filters.employmentType === "all" || jobEmploymentType === filters.employmentType;
      const matchesLocationType = filters.locationType === "all" || job.location_type === filters.locationType;
      const matchesExperienceLevel = filters.experienceLevel === "all" || job.experience_level === filters.experienceLevel;
      const matchesCountry = filters.country === "all" || job.country === filters.country;
      const matchesState = filters.state === "all" || job.state === filters.state;
      
      return matchesSearch && matchesEmploymentType && matchesLocationType && 
             matchesExperienceLevel && matchesCountry && matchesState;
    });

    if (relaxedFiltered.length > filtered.length) {
      filtered = relaxedFiltered;
      console.log(`Relaxed filtering (removed budget/duration): ${filtered.length} jobs`);
    }
    
    // Second fallback: Keep only essential filters (employment type) + text search
    if (filtered.length < 3) {
      relaxedFiltered = jobs.filter(job => {
        const matchesSearch = matchesSearchTerm(job, searchTerm);
        const jobEmploymentType = job.employment_type || job.role_type;
        const matchesEmploymentType = filters.employmentType === "all" || jobEmploymentType === filters.employmentType;
        
        return matchesSearch && matchesEmploymentType;
      });
      
      if (relaxedFiltered.length > filtered.length) {
        filtered = relaxedFiltered;
        console.log(`Highly relaxed filtering (employment + search): ${filtered.length} jobs`);
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

  return filtered;
};

// Sort filtered results
export const sortJobs = (jobs: any[], sortBy: string, sortOrder: "asc" | "desc") => {
  return jobs.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case "budget":
        const aEmploymentType = a.employment_type || a.role_type;
        const bEmploymentType = b.employment_type || b.role_type;
        aValue = parseBudget(a.budget, aEmploymentType);
        bValue = parseBudget(b.budget, bEmploymentType);
        break;
      case "applications":
        aValue = a.applications?.[0]?.count || 0;
        bValue = b.applications?.[0]?.count || 0;
        break;
      case "needs_attention":
        aValue = a.applicationStatusCounts?.pending || 0;
        bValue = b.applicationStatusCounts?.pending || 0;
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
};
