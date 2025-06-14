export interface JobFilters {
  employmentType: string;
  locationType: string;
  experienceLevel: string;
  country: string;
  state: string;
  budgetRange: number[];
  duration: string;
  status: string;
}

export const defaultFilters: JobFilters = {
  employmentType: "all",
  locationType: "all",
  experienceLevel: "all",
  country: "all",
  state: "all",
  budgetRange: [0, 200000],
  duration: "all",
  status: "all"
};

export interface AvailableOptions {
  employmentTypes: string[];
  locationTypes: string[];
  experienceLevels: string[];
  countries: string[];
  states: string[];
  durations: string[];
}

// Helper function to ensure filter values are valid
export const sanitizeFilters = (filters: Partial<JobFilters>): JobFilters => {
  return {
    employmentType: filters.employmentType || defaultFilters.employmentType,
    locationType: filters.locationType || defaultFilters.locationType,
    experienceLevel: filters.experienceLevel || defaultFilters.experienceLevel,
    country: filters.country || defaultFilters.country,
    state: filters.state || defaultFilters.state,
    budgetRange: Array.isArray(filters.budgetRange) && filters.budgetRange.length === 2 
      ? filters.budgetRange 
      : defaultFilters.budgetRange,
    duration: filters.duration || defaultFilters.duration,
    status: filters.status || defaultFilters.status
  };
};

// Helper function to validate sort values
export const validateSortBy = (sortBy: string): string => {
  const validSortOptions = [
    'updated_at',
    'created_at', 
    'needs_attention',
    'applications_desc',
    'applications_asc',
    'title_asc',
    'title_desc',
    'budget'
  ];
  
  return validSortOptions.includes(sortBy) ? sortBy : 'updated_at';
};
