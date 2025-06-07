
import { AvailableOptions } from "./types";

// Extract available options from jobs data
export const extractAvailableOptions = (jobs: any[]): AvailableOptions => {
  // Use employment_type preferentially, fall back to role_type
  const employmentTypes = [...new Set(jobs.map(job => job.employment_type || job.role_type).filter(Boolean))];
  const locationTypes = [...new Set(jobs.map(job => job.location_type).filter(Boolean))];
  const experienceLevels = [...new Set(jobs.map(job => job.experience_level).filter(Boolean))];
  const countries = [...new Set(jobs.map(job => job.country).filter(Boolean))];
  const states = [...new Set(jobs.map(job => job.state).filter(Boolean))];
  const durations = [...new Set(jobs.map(job => job.duration).filter(Boolean))];

  return {
    employmentTypes,
    locationTypes,
    experienceLevels,
    countries,
    states,
    durations
  };
};
