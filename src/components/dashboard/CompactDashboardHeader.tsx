
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { EditJobModal } from "@/components/EditJobModal";
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
  const {
    isUpdating,
    isEditModalOpen,
    setIsEditModalOpen,
    handleStatusChange,
    handleShareJob,
    handleExportApplications,
    handleEditJob,
    handleArchiveJob,
    handleUnarchiveJob
  } = useDashboardHeaderActions(job, applications, onJobUpdate);

  return (
    <>
      <DashboardHeaderLoader isVisible={isUpdating} />

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
              onStatusChange={handleStatusChange}
              onShareJob={handleShareJob}
              onEditJob={handleEditJob}
              onExportApplications={handleExportApplications}
              onArchiveJob={handleArchiveJob}
              onUnarchiveJob={handleUnarchiveJob}
            />
          </div>
        </div>
      </div>

      <EditJobModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        job={job}
        onJobUpdate={onJobUpdate}
      />
    </>
  );
};
