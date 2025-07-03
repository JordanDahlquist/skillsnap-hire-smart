
import { Button } from "@/components/ui/button";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ExternalLink, 
  Share2, 
  MoreHorizontal,
  Loader2,
  RefreshCw
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardHeaderDropdown } from "./DashboardHeaderDropdown";
import { Job } from "@/types";
import { useThemeContext } from "@/contexts/ThemeContext";

interface DashboardHeaderActionsProps {
  job: Job;
  isUpdating: boolean;
  onStatusChange: (newStatus: string) => void;
  onShareJob: () => void;
  onEditJob: () => void;
  onExportApplications: () => void;
  onArchiveJob: () => void;
  onUnarchiveJob: () => void;
  onRefreshAI: () => void;
  isRefreshingAI: boolean;
}

export const DashboardHeaderActions = ({
  job,
  isUpdating,
  onStatusChange,
  onShareJob,
  onEditJob,
  onExportApplications,
  onArchiveJob,
  onUnarchiveJob,
  onRefreshAI,
  isRefreshingAI
}: DashboardHeaderActionsProps) => {
  const isArchived = job.status === 'closed';
  const { currentTheme } = useThemeContext();

  console.log('DashboardHeaderActions render:', { 
    jobId: job.id, 
    status: job.status, 
    isUpdating,
    isArchived 
  });

  const handleStatusChange = (newStatus: string) => {
    console.log('Status change triggered from actions:', { from: job.status, to: newStatus });
    onStatusChange(newStatus);
  };

  // Get theme-aware AI Rank button classes
  const getAIRankButtonClasses = () => {
    if (currentTheme === 'black') {
      return "border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30 gap-2";
    }
    return "border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 gap-2";
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <StatusDropdown
          currentStatus={job.status}
          onStatusChange={handleStatusChange}
          disabled={isUpdating}
          size="sm"
        />

        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefreshAI}
              disabled={isUpdating || isRefreshingAI}
              className={getAIRankButtonClasses()}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingAI ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">AI Rank</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-[9999]">
            <p>Refresh AI-powered application rankings for new applicants</p>
          </TooltipContent>
        </Tooltip>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onShareJob} 
          disabled={isUpdating}
          title="Share job application link"
        >
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          disabled={isUpdating}
          title="View public job page"
        >
          <a href={`/job/${job.id}/apply`} target="_blank" rel="noopener noreferrer">
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
    </TooltipProvider>
  );
};
