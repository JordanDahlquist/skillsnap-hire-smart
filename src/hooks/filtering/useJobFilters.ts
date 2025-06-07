
import { useState } from "react";
import { JobFilters, defaultFilters } from "../job-filtering/types";

export const useJobFilters = () => {
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  
  const updateFilter = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters(defaultFilters);
  };
  
  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters
  };
};
