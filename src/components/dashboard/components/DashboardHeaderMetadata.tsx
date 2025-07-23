
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Clock, Users, Copy } from "lucide-react";
import { Job, Application } from "@/types";
import { useThemeContext } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface DashboardHeaderMetadataProps {
  job: Job;
  applications: Application[];
  isVisible: boolean;
}

export const DashboardHeaderMetadata = ({ job, applications, isVisible }: DashboardHeaderMetadataProps) => {
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

  // Theme-aware colors
  const cardBg = currentTheme === 'black' ? 'bg-gray-900/50' : 'bg-gray-50/50';
  const textColor = currentTheme === 'black' ? 'text-gray-200' : 'text-gray-600';
  const iconColor = currentTheme === 'black' ? 'text-gray-400' : 'text-gray-500';

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
    <div className={`mt-3 p-3 rounded-lg border border-border/50 ${cardBg} transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
            <div className="min-w-0">
              <span className={`text-xs font-medium ${textColor}`}>Started: </span>
              <span className={`text-sm font-medium ${currentTheme === 'black' ? 'text-white' : 'text-foreground'}`}>
                {startDateFormatted} {startTimeFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
            <div className="min-w-0">
              <span className={`text-xs font-medium ${textColor}`}>Duration: </span>
              <span className={`text-sm font-medium ${currentTheme === 'black' ? 'text-white' : 'text-foreground'}`}>
                {daysRunning} day{daysRunning !== 1 ? 's' : ''} running
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
            <div className="min-w-0">
              <span className={`text-xs font-medium ${textColor}`}>Applications: </span>
              <span className={`text-sm font-medium ${currentTheme === 'black' ? 'text-white' : 'text-foreground'}`}>
                {applications.length} received
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
            <div className="min-w-0">
              <span className={`text-xs font-medium ${textColor}`}>Views: </span>
              <span className={`text-sm font-medium ${currentTheme === 'black' ? 'text-white' : 'text-foreground'}`}>
                {viewCount} total
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${textColor}`}>Job ID:</span>
            <code className={`text-sm font-mono ${currentTheme === 'black' ? 'text-white' : 'text-foreground'} bg-background/50 px-2 py-1 rounded`}>
              {displayJobId}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyJobId}
              className="h-7 w-7 p-0 hover:bg-background/50"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
