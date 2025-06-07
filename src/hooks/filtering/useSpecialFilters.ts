
import { useState } from "react";

export const useSpecialFilters = () => {
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);
  const [activeJobsFilter, setActiveJobsFilter] = useState(false);
  
  const clearSpecialFilters = () => {
    setNeedsAttentionFilter(false);
    setActiveJobsFilter(false);
  };
  
  return {
    needsAttentionFilter,
    setNeedsAttentionFilter,
    activeJobsFilter,
    setActiveJobsFilter,
    clearSpecialFilters
  };
};
