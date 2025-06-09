
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Job, Application } from "@/types";

interface DashboardHeaderInfoProps {
  job: Job;
  applications: Application[];
  getTimeAgo: (dateString: string) => string;
}

export const DashboardHeaderInfo = ({ job, applications, getTimeAgo }: DashboardHeaderInfoProps) => {
  // Calculate days running
  const startDate = new Date(job.created_at);
  const today = new Date();
  const daysRunning = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format start date with time
  const startDateFormatted = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: startDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
  
  const startTimeFormatted = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-primary/10 text-primary";
      case 'paused':
        return "bg-muted text-muted-foreground";
      case 'closed':
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Use the real view_count from the database
  const viewCount = job.view_count || 0;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">{job.title}</h1>
        <Badge className={getStatusBadgeClasses(job.status)}>
          {job.status}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
        <span>Started {startDateFormatted}, {startTimeFormatted}</span>
        <span>•</span>
        <span>{daysRunning} day{daysRunning !== 1 ? 's' : ''} running</span>
        <span>•</span>
        <span>{applications.length} applications</span>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3 text-muted-foreground" />
          <span>{viewCount} views</span>
        </div>
      </div>
    </div>
  );
};
