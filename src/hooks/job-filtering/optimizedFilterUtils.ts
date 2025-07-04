
import { JobFilters } from "./types";
import { Job } from "@/types";

export const applyJobFiltersOptimized = (
  jobs: Job[],
  searchTerm: string,
  filters: JobFilters
): Job[] => {
  return jobs.filter(job => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchableText = [
        job.title,
        job.description,
        job.required_skills,
        job.company_name
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    // Employment type filter
    if (filters.employmentType !== "all" && job.employment_type !== filters.employmentType) {
      return false;
    }

    // Location type filter (supports arrays)
    if (filters.locationType && !filters.locationType.includes("all")) {
      if (!job.location_type || !filters.locationType.includes(job.location_type)) {
        return false;
      }
    }

    // Experience level filter
    if (filters.experienceLevel !== "all" && job.experience_level !== filters.experienceLevel) {
      return false;
    }

    // Country filter
    if (filters.country !== "all" && job.country !== filters.country) {
      return false;
    }

    // State filter
    if (filters.state !== "all" && job.state !== filters.state) {
      return false;
    }

    // Duration filter
    if (filters.duration !== "all" && job.duration !== filters.duration) {
      return false;
    }

    // Status filter (now supports arrays)
    if (filters.status && !filters.status.includes("all")) {
      if (!job.status || !filters.status.includes(job.status)) {
        return false;
      }
    }

    // Budget range filter
    if (job.budget && filters.budgetRange) {
      const budget = parseFloat(job.budget.replace(/[^0-9.-]/g, ''));
      if (!isNaN(budget)) {
        if (budget < filters.budgetRange[0] || budget > filters.budgetRange[1]) {
          return false;
        }
      }
    }

    return true;
  });
};

const getApplicationCount = (job: Job): number => {
  // Use applicationStatusCounts.total first, then fallback to applications array
  if (job.applicationStatusCounts?.total !== undefined) {
    return job.applicationStatusCounts.total;
  }
  
  // Fallback to applications array count
  if (job.applications && Array.isArray(job.applications)) {
    return job.applications.length;
  }
  
  // Last fallback to applications[0].count if it exists
  if (job.applications?.[0]?.count !== undefined) {
    return job.applications[0].count;
  }
  
  return 0;
};

export const sortJobs = (jobs: Job[], sortBy: string, sortOrder: "asc" | "desc"): Job[] => {
  console.log('Sorting jobs by:', sortBy, 'order:', sortOrder, 'total jobs:', jobs.length);
  
  const sorted = [...jobs].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'created_at':
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      case 'updated_at':
        aValue = new Date(a.updated_at || 0);
        bValue = new Date(b.updated_at || 0);
        break;
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'budget':
        aValue = parseFloat(a.budget?.replace(/[^0-9.-]/g, '') || '0');
        bValue = parseFloat(b.budget?.replace(/[^0-9.-]/g, '') || '0');
        break;
      case 'applications':
        aValue = getApplicationCount(a);
        bValue = getApplicationCount(b);
        console.log(`Job ${a.title}: ${aValue} applications, Job ${b.title}: ${bValue} applications`);
        break;
      case 'needs_attention':
        // Sort by pending applications count
        aValue = a.applicationStatusCounts?.pending || 0;
        bValue = b.applicationStatusCounts?.pending || 0;
        break;
      default:
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  console.log('Sorted jobs result:', sorted.map(job => ({ 
    title: job.title, 
    applicationCount: getApplicationCount(job) 
  })));

  return sorted;
};
