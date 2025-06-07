
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

export const defaultFilters: JobFilters = {
  roleType: "all",
  locationType: "all",
  experienceLevel: "all",
  employmentType: "all",
  country: "all",
  state: "all",
  budgetRange: [0, 200000],
  duration: "all"
};

export interface AvailableOptions {
  roleTypes: string[];
  locationTypes: string[];
  experienceLevels: string[];
  employmentTypes: string[];
  countries: string[];
  states: string[];
  durations: string[];
}
