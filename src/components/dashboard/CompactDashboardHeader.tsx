
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
      <AIAnalysisProgress
        totalApplications={aiAnalysisProgress.totalApplications}
        currentApplication={aiAnalysisProgress.currentApplication}
        currentPhase={aiAnalysisProgress.currentPhase}
        currentApplicantName={aiAnalysisProgress.currentApplicantName}
        parsedCount={aiAnalysisProgress.parsedCount}
        isVisible={aiAnalysisProgress.isVisible}
        onComplete={handleAIAnalysisComplete}
      />

      <DashboardHeaderLoader 
        isVisible={isUpdating && !aiAnalysisProgress.isVisible} 
        message="Updating job status..."
      />

      <div className={`bg-background/80 backdrop-blur-sm border-b border-border sticky ${DASHBOARD_HEADER_CONSTANTS.STICKY_TOP_OFFSET} ${DASHBOARD_HEADER_CONSTANTS.Z_INDEX}`}>
        <div className={`${DASHBOARD_HEADER_CONSTANTS.MAX_WIDTH} mx-auto ${DASHBOARD_HEADER_CONSTANTS.PADDING.HORIZONTAL} py-4`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Button variant="outline" size="sm" asChild className="mt-1 flex-shrink-0">
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
            
            <div className="flex-shrink-0">
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
