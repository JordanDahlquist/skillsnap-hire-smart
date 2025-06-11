
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UseJobsPageFiltersProps {
  needsAttentionFilter: boolean;
  setNeedsAttentionFilter: (value: boolean) => void;
  activeJobsFilter: boolean;
  setActiveJobsFilter: (value: boolean) => void;
  setSortBy: (value: string) => void;
}

export const useJobsPageFilters = ({
  needsAttentionFilter,
  setNeedsAttentionFilter,
  activeJobsFilter,
  setActiveJobsFilter,
  setSortBy
}: UseJobsPageFiltersProps) => {
  const { toast } = useToast();

  const handleNeedsAttentionClick = useCallback(() => {
    const newValue = !needsAttentionFilter;
    setNeedsAttentionFilter(newValue);
    setActiveJobsFilter(false);
    
    if (newValue) {
      setSortBy("needs_attention");
      toast({
        title: "Filtered by Attention",
        description: "Showing jobs with 10+ pending applications",
      });
    } else {
      toast({
        title: "Filter Cleared",
        description: "Showing all jobs",
      });
    }
  }, [needsAttentionFilter, setNeedsAttentionFilter, setActiveJobsFilter, setSortBy, toast]);

  const handleActiveJobsClick = useCallback(() => {
    const newValue = !activeJobsFilter;
    setActiveJobsFilter(newValue);
    setNeedsAttentionFilter(false);
    
    if (newValue) {
      setSortBy("updated_at");
      toast({
        title: "Filtered by Active Jobs",
        description: "Showing only active job postings",
      });
    } else {
      toast({
        title: "Filter Cleared",
        description: "Showing all jobs",
      });
    }
  }, [activeJobsFilter, setActiveJobsFilter, setNeedsAttentionFilter, setSortBy, toast]);

  return {
    handleNeedsAttentionClick,
    handleActiveJobsClick
  };
};
