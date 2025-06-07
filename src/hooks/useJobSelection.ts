
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { exportJobsToCSV } from "@/utils/exportUtils";
import { Job } from "@/types";
import { useSelection } from "./useSelection";

export const useJobSelection = (jobs: Job[], onUpdate: () => void) => {
  const { toast } = useToast();
  const {
    selectedItems: selectedJobs,
    handleSelection: handleJobSelection,
    handleSelectAll,
    clearSelection
  } = useSelection<string>(jobs.map(job => job.id));

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedJobs.length === 0) return;

    try {
      switch (action) {
        case 'activate':
        case 'pause':
        case 'archive':
          const status = action === 'activate' ? 'active' : action === 'pause' ? 'paused' : 'closed';
          const { error } = await supabase
            .from('jobs')
            .update({ status, updated_at: new Date().toISOString() })
            .in('id', selectedJobs);

          if (error) throw error;

          toast({
            title: "Bulk action completed",
            description: `${selectedJobs.length} job(s) ${action}d successfully`,
          });
          break;

        case 'export':
          const selectedJobsData = jobs.filter(job => selectedJobs.includes(job.id));
          exportJobsToCSV(selectedJobsData);
          toast({
            title: "Export completed",
            description: "Job data exported to CSV file",
          });
          break;
      }

      clearSelection();
      onUpdate();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  }, [selectedJobs, jobs, onUpdate, toast, clearSelection]);

  return {
    selectedJobs,
    handleJobSelection,
    handleSelectAll: (checked: boolean, filteredJobs: Job[]) => handleSelectAll(checked, filteredJobs.map(job => job.id)),
    handleBulkAction,
    clearSelection
  };
};
