
import { Button } from "@/components/ui/button";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { 
  ExternalLink, 
  Share2, 
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardHeaderDropdown } from "./DashboardHeaderDropdown";

interface Job {
  id: string;
  status: string;
}

interface DashboardHeaderActionsProps {
  job: Job;
  isUpdating: boolean;
  onStatusChange: (newStatus: string) => void;
  onShareJob: () => void;
  onEditJob: () => void;
  onExportApplications: () => void;
  onArchiveJob: () => void;
  onUnarchiveJob: () => void;
}

export const DashboardHeaderActions = ({
  job,
  isUpdating,
  onStatusChange,
  onShareJob,
  onEditJob,
  onExportApplications,
  onArchiveJob,
  onUnarchiveJob
}: DashboardHeaderActionsProps) => {
  const isArchived = job.status === 'closed';

  return (
    <div className="flex items-center gap-2">
      <StatusDropdown
        currentStatus={job.status}
        onStatusChange={onStatusChange}
        disabled={isUpdating}
      />

      <Button variant="outline" size="sm" onClick={onShareJob} disabled={isUpdating}>
        <Share2 className="w-4 h-4 text-muted-foreground" />
      </Button>

      <Button variant="outline" size="sm" asChild disabled={isUpdating}>
        <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
      </Button>

      <DashboardHeaderDropdown
        isUpdating={isUpdating}
        isArchived={isArchived}
        onEditJob={onEditJob}
        onExportApplications={onExportApplications}
        onArchiveJob={onArchiveJob}
        onUnarchiveJob={onUnarchiveJob}
      />
    </div>
  );
};
