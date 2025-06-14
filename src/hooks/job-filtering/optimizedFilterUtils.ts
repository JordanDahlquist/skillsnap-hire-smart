
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

    // Location type filter
    if (filters.locationType !== "all" && job.location_type !== filters.locationType) {
      return false;
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

    // Status filter - this was missing before
    if (filters.status !== "all" && job.status !== filters.status) {
      return false;
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

export const sortJobs = (jobs: Job[], sortBy: string, sortOrder: "asc" | "desc"): Job[] => {
  const sorted = [...jobs].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'updated_at':
        aValue = new Date(a.updated_at || 0);
        bValue = new Date(b.updated_at || 0);
        break;
      case 'created_at':
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      case 'title_asc':
      case 'title_desc':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'budget':
        aValue = parseFloat(a.budget?.replace(/[^0-9.-]/g, '') || '0');
        bValue = parseFloat(b.budget?.replace(/[^0-9.-]/g, '') || '0');
        break;
      case 'applications_desc':
      case 'applications_asc':
        aValue = a.applicationStatusCounts?.total || 0;
        bValue = b.applicationStatusCounts?.total || 0;
        break;
      default:
        aValue = a.updated_at;
        bValue = b.updated_at;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};
