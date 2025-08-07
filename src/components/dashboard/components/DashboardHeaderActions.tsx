
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
  RefreshCw
} from "lucide-react";
import { DashboardHeaderDropdown } from "./DashboardHeaderDropdown";
import { Job, Application } from "@/types";
import { useThemeContext } from "@/contexts/ThemeContext";

interface DashboardHeaderActionsProps {
  job: Job;
  applications: Application[];
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
  applications,
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
  const { currentTheme } = useThemeContext();

  // Count applications that need resume processing
  const unparsedResumeCount = applications.filter(app => 
    app.resume_file_path && !app.parsed_resume_data
  ).length;

  // Disable AI Rank if updating/refreshing or fewer than 3 candidates
  const aiDisabled = isUpdating || isRefreshingAI || applications.length < 3;

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
  };

  // Get theme-aware AI Rank button classes
  const getAIRankButtonClasses = () => {
    if (aiDisabled) {
      return "border-border text-muted-foreground opacity-60 cursor-not-allowed";
    }
    if (currentTheme === 'black') {
      return "border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30";
    }
    return "border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300";
  };

  // Create dynamic tooltip content
  const getAIRankTooltip = () => {
    if (applications.length < 3) {
      return "You need at least 3 candidates before you can use AI Rank";
    }
    if (unparsedResumeCount > 0) {
      return `Process ${unparsedResumeCount} unprocessed resumes and analyze all applications with AI`;
    }
    return "Refresh AI-powered application rankings";
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
            <span className="inline-flex">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefreshAI}
                disabled={aiDisabled}
                className={`gap-2 ${getAIRankButtonClasses()}`}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingAI ? 'animate-spin' : ''}`} />
                <span className="font-medium">
                  AI Rank
                  {unparsedResumeCount > 0 && (
                    <span className="ml-1 text-xs bg-orange-500 text-white px-1 rounded-full">
                      {unparsedResumeCount}
                    </span>
                  )}
                </span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-[9999]">
            <p>{getAIRankTooltip()}</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShareJob} 
            disabled={isUpdating}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            disabled={isUpdating}
          >
            <a href={`/job/${job.id}/apply`} target="_blank" rel="noopener noreferrer" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </a>
          </Button>
        </div>

        <DashboardHeaderDropdown
          isUpdating={isUpdating}
          isArchived={job.status === 'closed'}
          onEditJob={onEditJob}
          onExportApplications={onExportApplications}
          onArchiveJob={onArchiveJob}
          onUnarchiveJob={onUnarchiveJob}
        />
      </div>
    </TooltipProvider>
  );
};
