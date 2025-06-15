
import { Button } from "@/components/ui/button";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal,
  RefreshCw,
  Edit,
  Download,
  Archive,
  ArchiveRestore
} from "lucide-react";
import { Job } from "@/types";

interface MobileDashboardHeaderActionsProps {
  job: Job;
  isUpdating: boolean;
  onStatusChange: (newStatus: string) => void;
  onEditJob: () => void;
  onExportApplications: () => void;
  onArchiveJob: () => void;
  onUnarchiveJob: () => void;
  onRefreshAI: () => void;
  isRefreshingAI: boolean;
}

export const MobileDashboardHeaderActions = ({
  job,
  isUpdating,
  onStatusChange,
  onEditJob,
  onExportApplications,
  onArchiveJob,
  onUnarchiveJob,
  onRefreshAI,
  isRefreshingAI
}: MobileDashboardHeaderActionsProps) => {
  const isArchived = job.status === 'closed';

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Status Dropdown - Full width on mobile */}
      <div className="flex-1">
        <StatusDropdown
          currentStatus={job.status}
          onStatusChange={onStatusChange}
          disabled={isUpdating}
        />
      </div>

      {/* AI Refresh Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefreshAI}
        disabled={isUpdating || isRefreshingAI}
        className="gap-2 flex-shrink-0"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshingAI ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">AI Rank</span>
      </Button>

      {/* More Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isUpdating}
            className="flex-shrink-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onEditJob}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Job
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportApplications}>
            <Download className="w-4 h-4 mr-2" />
            Export Applications
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isArchived ? (
            <DropdownMenuItem onClick={onUnarchiveJob}>
              <ArchiveRestore className="w-4 h-4 mr-2" />
              Unarchive Job
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onArchiveJob}>
              <Archive className="w-4 h-4 mr-2" />
              Archive Job
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
