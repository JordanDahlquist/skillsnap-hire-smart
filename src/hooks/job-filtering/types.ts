
export interface JobFilters {
  employmentType: string;
  locationType: string;
  experienceLevel: string;
  country: string;
  state: string;
  budgetRange: number[];
  duration: string;
}

export const defaultFilters: JobFilters = {
  employmentType: "all",
  locationType: "all",
  experienceLevel: "all",
  country: "all",
  state: "all",
  budgetRange: [0, 200000],
  duration: "all"
};

export interface AvailableOptions {
  employmentTypes: string[];
  locationTypes: string[];
  experienceLevels: string[];
  countries: string[];
  states: string[];
  durations: string[];
}
