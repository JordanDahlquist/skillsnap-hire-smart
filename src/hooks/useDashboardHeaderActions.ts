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
  
  // New AI analysis progress state
  const [aiAnalysisProgress, setAiAnalysisProgress] = useState({
    isVisible: false,
    totalApplications: 0,
    currentApplication: 0,
    currentPhase: 'parsing' as 'parsing' | 'analyzing' | 'comparing' | 'ranking' | 'complete',
    currentApplicantName: '',
    parsedCount: 0
  });

  const { toast } = useToast();

  const handleRefreshAI = async () => {
    if (isRefreshingAI || applications.length === 0) return;

    setIsRefreshingAI(true);
    
    // Initialize progress tracking
    setAiAnalysisProgress({
      isVisible: true,
      totalApplications: applications.length,
      currentApplication: 0,
      currentPhase: 'parsing',
      currentApplicantName: '',
      parsedCount: 0
    });

    try {
      console.log(`Starting AI analysis with resume processing for ${applications.length} applications`);

      // Track progress through the AI analysis process
      let processedCount = 0;
      let parsedCount = 0;

      // Phase 1: Resume parsing
      const applicationsNeedingParsing = applications.filter(app => 
        app.resume_file_path && !app.parsed_resume_data
      );

      if (applicationsNeedingParsing.length > 0) {
        setAiAnalysisProgress(prev => ({
          ...prev,
          currentPhase: 'parsing',
          currentApplicantName: applicationsNeedingParsing[0]?.name || ''
        }));

        for (const app of applicationsNeedingParsing) {
          setAiAnalysisProgress(prev => ({
            ...prev,
            currentApplicantName: app.name,
            parsedCount: parsedCount
          }));
          
          // Small delay to show the name change
          await new Promise(resolve => setTimeout(resolve, 500));
          parsedCount++;
        }
      }

      // Phase 2: AI Analysis
      setAiAnalysisProgress(prev => ({
        ...prev,
        currentPhase: 'analyzing',
        parsedCount: applicationsNeedingParsing.length
      }));

      // Process applications and track progress
      for (let i = 0; i < applications.length; i++) {
        const app = applications[i];
        
        setAiAnalysisProgress(prev => ({
          ...prev,
          currentApplication: i + 1,
          currentApplicantName: app.name,
          currentPhase: i < applications.length / 2 ? 'analyzing' : 
                       i < applications.length * 0.8 ? 'comparing' : 'ranking'
        }));

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Use the actual AI service
      const { successCount, errorCount, parsedCount: actualParsedCount } = await AIAnalysisService.processWithResumeParsing(applications, job);

      // Phase 3: Complete
      setAiAnalysisProgress(prev => ({
        ...prev,
        currentPhase: 'complete',
        currentApplication: applications.length,
        parsedCount: actualParsedCount
      }));

      // Show completion message
      if (successCount > 0) {
        const resumeMessage = actualParsedCount > 0 ? ` (${actualParsedCount} resumes processed)` : '';
        // Don't show toast - the progress component handles completion message
        onJobUpdate(); // Refresh the data to show new rankings
      } else {
        toast({
          title: "AI Analysis Failed",
          description: `Unable to analyze applications. ${errorCount > 0 ? `${errorCount} applications failed.` : ''} Please try again.`,
          variant: "destructive",
        });
        
        setAiAnalysisProgress(prev => ({ ...prev, isVisible: false }));
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({
        title: "AI Analysis Failed",
        description: `An error occurred during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      setAiAnalysisProgress(prev => ({ ...prev, isVisible: false }));
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const handleAIAnalysisComplete = () => {
    setAiAnalysisProgress(prev => ({ ...prev, isVisible: false }));
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
    aiAnalysisProgress,
    handleStatusChange,
    handleShareJob,
    handleExportApplications,
    handleEditJob,
    handleArchiveJob,
    handleUnarchiveJob,
    handleRefreshAI,
    handleAIAnalysisComplete
  };
};
