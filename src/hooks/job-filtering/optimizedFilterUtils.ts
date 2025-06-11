
import { JobFilters } from "./types";
import { matchesSearchTerm } from "./jobMatching";

// Memoized budget parser with better performance and error handling
const budgetCache = new Map<string, number>();

export const parseBudgetOptimized = (budgetStr: string | null, employmentType: string = 'project'): number => {
  if (!budgetStr || budgetStr.trim() === '') return 0;
  
  const cacheKey = `${budgetStr}-${employmentType}`;
  if (budgetCache.has(cacheKey)) {
    return budgetCache.get(cacheKey)!;
  }
  
  try {
    const cleanBudget = budgetStr.replace(/[^\d.,kK]/g, '');
    
    let amount = 0;
    if (cleanBudget.includes('k') || cleanBudget.includes('K')) {
      amount = parseFloat(cleanBudget.replace(/[kK]/g, '')) * 1000;
    } else {
      amount = parseFloat(cleanBudget.replace(/,/g, '')) || 0;
      
      // Handle hourly rates for full-time/part-time positions
      if ((employmentType === 'full-time' || employmentType === 'part-time') && amount > 0 && amount < 1000) {
        const hoursPerYear = employmentType === 'full-time' ? 2000 : 1000;
        amount = amount * hoursPerYear;
      }
    }
    
    // Ensure we don't cache invalid values
    if (isNaN(amount) || amount < 0) {
      amount = 0;
    }
    
    budgetCache.set(cacheKey, amount);
    return amount;
  } catch (error) {
    console.warn('Error parsing budget:', budgetStr, error);
    budgetCache.set(cacheKey, 0);
    return 0;
  }
};

// Optimized filtering with reduced complexity and better error handling
export const applyJobFiltersOptimized = (jobs: any[], searchTerm: string, filters: JobFilters) => {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return [];
  }
  
  try {
    return jobs.filter(job => {
      if (!job) return false;
      
      // Text search first (most likely to eliminate jobs)
      if (searchTerm && searchTerm.trim() && !matchesSearchTerm(job, searchTerm)) {
        return false;
      }
      
      // Employment type check with fallback
      const jobEmploymentType = job.employment_type || job.role_type || '';
      if (filters.employmentType && filters.employmentType !== "all" && jobEmploymentType !== filters.employmentType) {
        return false;
      }
      
      // Location type check with fallback
      const jobLocationType = job.location_type || '';
      if (filters.locationType && filters.locationType !== "all" && jobLocationType !== filters.locationType) {
        return false;
      }
      
      // Experience level check with fallback
      const jobExperienceLevel = job.experience_level || '';
      if (filters.experienceLevel && filters.experienceLevel !== "all" && jobExperienceLevel !== filters.experienceLevel) {
        return false;
      }
      
      // Country check with fallback
      const jobCountry = job.country || '';
      if (filters.country && filters.country !== "all" && jobCountry !== filters.country) {
        return false;
      }
      
      // State check with fallback
      const jobState = job.state || '';
      if (filters.state && filters.state !== "all" && jobState !== filters.state) {
        return false;
      }
      
      // Duration check with fallback
      const jobDuration = job.duration || '';
      if (filters.duration && filters.duration !== "all" && jobDuration !== filters.duration) {
        return false;
      }
      
      // Budget check (most expensive, do last)
      if (filters.budgetRange && Array.isArray(filters.budgetRange) && filters.budgetRange.length === 2) {
        const [minBudget, maxBudget] = filters.budgetRange;
        if (minBudget > 0 || maxBudget < 200000) {
          const jobBudget = parseBudgetOptimized(job.budget, jobEmploymentType);
          if (jobBudget > 0 && (jobBudget < minBudget || jobBudget > maxBudget)) {
            return false;
          }
        }
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error in job filtering:', error);
    return jobs; // Return original jobs if filtering fails
  }
};

// Optimized sorting with better error handling
export const sortJobs = (jobs: any[], sortBy: string, sortOrder: "asc" | "desc" = "desc") => {
  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return jobs;
  }
  
  try {
    return jobs.sort((a, b) => {
      if (!a || !b) return 0;
      
      let aValue, bValue;
      
      switch (sortBy) {
        case "budget":
          const aEmploymentType = a.employment_type || a.role_type || '';
          const bEmploymentType = b.employment_type || b.role_type || '';
          aValue = parseBudgetOptimized(a.budget, aEmploymentType);
          bValue = parseBudgetOptimized(b.budget, bEmploymentType);
          break;
        case "applications":
        case "applications_desc":
        case "applications_asc":
          aValue = a.applications?.[0]?.count || a.applicationStatusCounts?.total || 0;
          bValue = b.applications?.[0]?.count || b.applicationStatusCounts?.total || 0;
          // For applications_asc, we'll reverse the sort order
          if (sortBy === "applications_asc") {
            [aValue, bValue] = [bValue, aValue];
          }
          break;
        case "needs_attention":
          aValue = a.applicationStatusCounts?.pending || 0;
          bValue = b.applicationStatusCounts?.pending || 0;
          break;
        case "created_at":
        case "updated_at":
          aValue = new Date(a[sortBy] || 0).getTime();
          bValue = new Date(b[sortBy] || 0).getTime();
          break;
        case "title_asc":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          return aValue.localeCompare(bValue);
        case "title_desc":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          return bValue.localeCompare(aValue);
        default:
          aValue = a[sortBy] || "";
          bValue = b[sortBy] || "";
      }
      
      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle numeric comparisons
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  } catch (error) {
    console.error('Error in job sorting:', error);
    return jobs; // Return original jobs if sorting fails
  }
};
