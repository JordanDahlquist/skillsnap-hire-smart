import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Clock, Users, Copy } from "lucide-react";
import { Job, Application } from "@/types";
import { useThemeContext } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface FullWidthInsightsBarProps {
  job: Job;
  applications: Application[];
  isVisible: boolean;
}

export const FullWidthInsightsBar = ({ job, applications, isVisible }: FullWidthInsightsBarProps) => {
  const { currentTheme } = useThemeContext();
  
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

  const viewCount = job.view_count || 0;

  // Job ID display (first 8 characters + ellipsis)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-muted-foreground">Started</div>
                <div className="text-base font-semibold text-foreground">
                  {startDateFormatted} {startTimeFormatted}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-muted-foreground">Duration</div>
                <div className="text-base font-semibold text-foreground">
                  {daysRunning} day{daysRunning !== 1 ? 's' : ''} running
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-muted-foreground">Applications</div>
                <div className="text-base font-semibold text-foreground">
                  {applications.length} received
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Eye className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-muted-foreground">Views</div>
                <div className="text-base font-semibold text-foreground">
                  {viewCount} total
                </div>
              </div>
            </div>
          </div>

          {/* Job ID Section */}
          <div className="flex items-center gap-3 lg:border-l lg:border-border/50 lg:pl-6">
            <div className="min-w-0">
              <div className="text-sm font-medium text-muted-foreground">Job ID</div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded border">
                  {displayJobId}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyJobId}
                  className="h-7 w-7 p-0 hover:bg-background/80"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};