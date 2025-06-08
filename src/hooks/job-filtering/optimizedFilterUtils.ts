
import { JobFilters } from "./types";
import { matchesSearchTerm } from "./jobMatching";

// Memoized budget parser with better performance
const budgetCache = new Map<string, number>();

export const parseBudgetOptimized = (budgetStr: string | null, employmentType: string = 'project'): number => {
  if (!budgetStr || budgetStr.trim() === '') return 0;
  
  const cacheKey = `${budgetStr}-${employmentType}`;
  if (budgetCache.has(cacheKey)) {
    return budgetCache.get(cacheKey)!;
  }
  
  const cleanBudget = budgetStr.replace(/[^\d.,kK]/g, '');
  
  let amount = 0;
  if (cleanBudget.includes('k') || cleanBudget.includes('K')) {
    amount = parseFloat(cleanBudget.replace(/[kK]/g, '')) * 1000;
  } else {
    amount = parseFloat(cleanBudget.replace(/,/g, '')) || 0;
    
    // Handle hourly rates for full-time/part-time positions
    if ((employmentType === 'full-time' || employmentType === 'part-time') && amount < 1000) {
      const hoursPerYear = employmentType === 'full-time' ? 2000 : 1000;
      amount = amount * hoursPerYear;
    }
  }
  
  budgetCache.set(cacheKey, amount);
  return amount;
};

// Optimized filtering with reduced complexity
export const applyJobFiltersOptimized = (jobs: any[], searchTerm: string, filters: JobFilters) => {
  if (!jobs.length) return [];
  
  return jobs.filter(job => {
    // Text search first (most likely to eliminate jobs)
    if (searchTerm && !matchesSearchTerm(job, searchTerm)) {
      return false;
    }
    
    // Employment type check
    const jobEmploymentType = job.employment_type || job.role_type;
    if (filters.employmentType !== "all" && jobEmploymentType !== filters.employmentType) {
      return false;
    }
    
    // Location type check
    if (filters.locationType !== "all" && job.location_type !== filters.locationType) {
      return false;
    }
    
    // Experience level check
    if (filters.experienceLevel !== "all" && job.experience_level !== filters.experienceLevel) {
      return false;
    }
    
    // Country check
    if (filters.country !== "all" && job.country !== filters.country) {
      return false;
    }
    
    // State check
    if (filters.state !== "all" && job.state !== filters.state) {
      return false;
    }
    
    // Duration check
    if (filters.duration !== "all" && job.duration !== filters.duration) {
      return false;
    }
    
    // Budget check (most expensive, do last)
    const [minBudget, maxBudget] = filters.budgetRange;
    if (minBudget > 0 || maxBudget < 200000) {
      const jobBudget = parseBudgetOptimized(job.budget, jobEmploymentType);
      if (jobBudget > 0 && (jobBudget < minBudget || jobBudget > maxBudget)) {
        return false;
      }
    }
    
    return true;
  });
};

// Optimized sorting
export const sortJobs = (jobs: any[], sortBy: string, sortOrder: "asc" | "desc") => {
  if (!jobs.length) return jobs;
  
  return jobs.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case "budget":
        const aEmploymentType = a.employment_type || a.role_type;
        const bEmploymentType = b.employment_type || b.role_type;
        aValue = parseBudgetOptimized(a.budget, aEmploymentType);
        bValue = parseBudgetOptimized(b.budget, bEmploymentType);
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
