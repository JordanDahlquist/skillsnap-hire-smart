import { Button } from "@/components/ui/button";
import { Eye, Calendar, Clock, Users, Copy } from "lucide-react";
import { Job, Application } from "@/types";
import { toast } from "sonner";

interface FullWidthInsightsBarProps {
  job: Job;
  applications: Application[];
  isVisible: boolean;
}

export const FullWidthInsightsBar = ({ job, applications, isVisible }: FullWidthInsightsBarProps) => {
  // Calculate days running
  const startDate = new Date(job.created_at);
  const today = new Date();
  const daysRunning = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format start date
  const startDateFormatted = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: startDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });

  const viewCount = job.view_count || 0;
  const displayJobId = job.id.substring(0, 8) + '...';

  const handleCopyJobId = async () => {
    try {
      await navigator.clipboard.writeText(job.id);
      toast.success('Job ID copied to clipboard');
    } catch (error) {
      console.error('Failed to copy job ID:', error);
      toast.error('Failed to copy job ID');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Started:</span>
              <span className="font-medium text-foreground text-xs">{startDateFormatted}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Running:</span>
              <span className="font-medium text-foreground text-xs">{daysRunning} day{daysRunning !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Applications:</span>
              <span className="font-medium text-foreground text-xs">{applications.length}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Views:</span>
              <span className="font-medium text-foreground text-xs">{viewCount}</span>
            </div>
          </div>

          {/* Job ID */}
          <div className="flex items-center gap-2 lg:pl-4 lg:border-l lg:border-border/50">
            <span className="text-xs text-muted-foreground">Job ID:</span>
            <code className="text-xs font-mono text-foreground bg-background px-2 py-1 rounded border">
              {displayJobId}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyJobId}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};