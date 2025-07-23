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
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Metrics */}
          <div className="flex flex-col md:flex-row md:items-center gap-8 flex-1">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Started:</span>
              <span className="font-semibold text-foreground">{startDateFormatted}</span>
            </div>
            
            <div className="hidden md:block w-px h-6 bg-border/50" />
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Running:</span>
              <span className="font-semibold text-foreground">{daysRunning} day{daysRunning !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="hidden md:block w-px h-6 bg-border/50" />
            
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Applications:</span>
              <span className="font-semibold text-foreground">{applications.length}</span>
            </div>
            
            <div className="hidden md:block w-px h-6 bg-border/50" />
            
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Views:</span>
              <span className="font-semibold text-foreground">{viewCount}</span>
            </div>
          </div>

          {/* Job ID */}
          <div className="flex items-center gap-3 md:pl-8 md:border-l md:border-border/50">
            <span className="text-sm text-muted-foreground">Job ID:</span>
            <code className="text-sm font-mono text-foreground bg-background px-3 py-1.5 rounded border">
              {displayJobId}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyJobId}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};