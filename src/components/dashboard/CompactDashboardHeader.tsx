
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { UnifiedJobCreatorPanel } from "@/components/UnifiedJobCreatorPanel";
import { DashboardHeaderInfo } from "./components/DashboardHeaderInfo";
import { DashboardHeaderActions } from "./components/DashboardHeaderActions";
import { DashboardHeaderLoader } from "./components/DashboardHeaderLoader";
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
    handleStatusChange,
    handleShareJob,
    handleExportApplications,
    handleEditJob,
    handleArchiveJob,
    handleUnarchiveJob,
    handleRefreshAI
  } = useDashboardHeaderActions(job, applications, onJobUpdate);

  // Determine the loading message based on the operation
  const getLoadingMessage = () => {
    if (isRefreshingAI) return "Updating job rankings...";
    if (isUpdating) return "Updating job status...";
    return "Loading...";
  };

  const handleJobUpdated = () => {
    onJobUpdate();
    setIsEditModalOpen(false);
  };

  return (
    <>
      <DashboardHeaderLoader 
        isVisible={isUpdating || isRefreshingAI} 
        message={getLoadingMessage()}
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
