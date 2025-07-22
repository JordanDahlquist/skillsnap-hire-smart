import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { UnifiedJobCreatorPanel } from "@/components/UnifiedJobCreatorPanel";
import { DashboardHeaderInfo } from "./components/DashboardHeaderInfo";
import { DashboardHeaderActions } from "./components/DashboardHeaderActions";
import { DashboardHeaderLoader } from "./components/DashboardHeaderLoader";
import { AIAnalysisProgress } from "./components/AIAnalysisProgress";
import { useDashboardHeaderActions } from "@/hooks/useDashboardHeaderActions";
import { DASHBOARD_HEADER_CONSTANTS } from "./constants/dashboardHeaderConstants";
import { Job, Application } from "@/types";

interface CompactDashboardHeaderProps {
  job: Job;
  applications: Application[];
  getTimeAgo: (dateString: string) => string;
  onJobUpdate: () => void;
}

export const CompactDashboardHeader = ({ 
  job, 
  applications, 
  getTimeAgo, 
  onJobUpdate 
}: CompactDashboardHeaderProps) => {
  console.log('CompactDashboardHeader render:', { 
    jobId: job.id, 
    status: job.status, 
    applicationsCount: applications.length 
  });

  const {
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
  } = useDashboardHeaderActions(job, applications, onJobUpdate);

  const handleJobUpdated = () => {
    onJobUpdate();
    setIsEditModalOpen(false);
  };

  return (
    <>
      {/* Show AI Analysis Progress instead of generic loader when doing AI analysis */}
      <AIAnalysisProgress
        totalApplications={aiAnalysisProgress.totalApplications}
        currentApplication={aiAnalysisProgress.currentApplication}
        currentPhase={aiAnalysisProgress.currentPhase}
        currentApplicantName={aiAnalysisProgress.currentApplicantName}
        parsedCount={aiAnalysisProgress.parsedCount}
        isVisible={aiAnalysisProgress.isVisible}
        onComplete={handleAIAnalysisComplete}
      />

      {/* Keep the regular loader for non-AI updates */}
      <DashboardHeaderLoader 
        isVisible={isUpdating && !aiAnalysisProgress.isVisible} 
        message="Updating job status..."
      />

      <div className={`bg-background/80 backdrop-blur-sm border-b border-border sticky ${DASHBOARD_HEADER_CONSTANTS.STICKY_TOP_OFFSET} ${DASHBOARD_HEADER_CONSTANTS.Z_INDEX}`}>
        <div className={`${DASHBOARD_HEADER_CONSTANTS.MAX_WIDTH} mx-auto ${DASHBOARD_HEADER_CONSTANTS.PADDING.HORIZONTAL} ${DASHBOARD_HEADER_CONSTANTS.PADDING.VERTICAL}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/jobs">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </Link>
              </Button>
              
              <DashboardHeaderInfo 
                job={job}
                applications={applications}
                getTimeAgo={getTimeAgo}
              />
            </div>
            
            <DashboardHeaderActions
              job={job}
              applications={applications}
              isUpdating={isUpdating}
              isRefreshingAI={isRefreshingAI}
              onStatusChange={handleStatusChange}
              onShareJob={handleShareJob}
              onEditJob={handleEditJob}
              onExportApplications={handleExportApplications}
              onArchiveJob={handleArchiveJob}
              onUnarchiveJob={handleUnarchiveJob}
              onRefreshAI={handleRefreshAI}
            />
          </div>
        </div>
      </div>

      <UnifiedJobCreatorPanel
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onJobCreated={handleJobUpdated}
        editingJob={job}
      />
    </>
  );
};
