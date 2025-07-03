import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Job, Application } from "@/types";
import { AIAnalysisService } from "@/services/aiAnalysisService";
import { JobStatusService } from "@/services/jobStatusService";
import { ExportService } from "@/services/exportService";
import { DASHBOARD_ACTION_CONSTANTS } from "@/constants/dashboardActions";

export const useDashboardHeaderActions = (
  job: Job, 
  applications: Application[], 
  onJobUpdate: () => void
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const handleRefreshAI = async () => {
    if (isRefreshingAI || applications.length === 0) return;

    setIsRefreshingAI(true);

    try {
      const { MESSAGES, AI_REFRESH } = DASHBOARD_ACTION_CONSTANTS;
      
      toast({
        title: "AI Re-ranking Started",
        description: `Re-analyzing all ${applications.length} applications to update rankings. This may take ${AI_REFRESH.TIMEOUT_RANGE}.`,
      });

      console.log(`Starting AI re-ranking for ${applications.length} applications`);

      const { successCount, errorCount } = await AIAnalysisService.processBatch(applications, job);

      // Show completion message
      if (successCount > 0) {
        toast({
          title: "AI Re-ranking Complete",
          description: `Successfully re-analyzed ${successCount} applications${errorCount > 0 ? `, ${errorCount} failed` : ''}. Rankings have been updated.`,
        });
        onJobUpdate(); // Refresh the data to show new rankings
      } else {
        toast({
          title: "AI Re-ranking Failed",
          description: `Unable to re-analyze applications. ${errorCount > 0 ? `${errorCount} applications failed.` : ''} Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('AI refresh failed:', error);
      toast({
        title: "AI Re-ranking Failed",
        description: `An error occurred during re-analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Prevent multiple concurrent updates
    if (isUpdating) {
      console.log('Update already in progress, ignoring');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { success, error } = await JobStatusService.updateJobStatus(job, newStatus);
      
      if (success) {
        toast({
          title: DASHBOARD_ACTION_CONSTANTS.MESSAGES.STATUS_UPDATED,
          description: `Job status changed to ${newStatus}`,
        });
        onJobUpdate();
      } else {
        toast({
          title: DASHBOARD_ACTION_CONSTANTS.MESSAGES.UPDATE_FAILED,
          description: error?.message || 'Failed to update job status',
          variant: "destructive",
        });

        // If authentication error, suggest refresh
        if (error?.needsRefresh) {
          setTimeout(() => {
            toast({
              title: "Try refreshing",
              description: "Your session may have expired. Try refreshing the page.",
            });
          }, 2000);
        }
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareJob = async () => {
    try {
      await ExportService.copyJobLinkToClipboard(job.id);
      toast({
        title: DASHBOARD_ACTION_CONSTANTS.MESSAGES.LINK_COPIED,
        description: "Job application link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleExportApplications = () => {
    if (applications.length === 0) {
      toast({
        title: DASHBOARD_ACTION_CONSTANTS.MESSAGES.NO_DATA_EXPORT,
        description: "This job has no applications yet",
      });
      return;
    }

    try {
      ExportService.exportApplicationsToCSV(job, applications);
      toast({
        title: DASHBOARD_ACTION_CONSTANTS.MESSAGES.EXPORT_COMPLETED,
        description: "Applications data exported to CSV file",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: DASHBOARD_ACTION_CONSTANTS.MESSAGES.EXPORT_FAILED,
        description: "Failed to export applications data",
        variant: "destructive",
      });
    }
  };

  const handleEditJob = () => {
    setIsEditModalOpen(true);
  };

  const handleArchiveJob = async () => {
    await handleStatusChange('closed');
  };

  const handleUnarchiveJob = async () => {
    await handleStatusChange('active');
  };

  return {
    isUpdating,
    isRefreshingAI,
    isEditModalOpen,
    setIsEditModalOpen,
    handleStatusChange,
    handleShareJob,
    handleExportApplications,
    handleEditJob,
    handleArchiveJob,
    handleUnarchiveJob,
    handleRefreshAI
  };
};
