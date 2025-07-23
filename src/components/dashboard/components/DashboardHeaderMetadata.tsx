
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { Job, Application } from "@/types";
import { useThemeContext } from "@/contexts/ThemeContext";

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

  if (!isVisible) return null;

  return (
    <div className={`mt-3 p-4 rounded-lg border border-border/50 ${cardBg} transition-all duration-200`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${iconColor}`} />
          <div>
            <div className={`text-xs font-medium ${textColor}`}>Started</div>
            <div className={`text-sm ${currentTheme === 'black' ? 'text-white' : 'text-foreground'}`}>
              {startDateFormatted}
            </div>
            <div className={`text-xs ${textColor}`}>
              {startTimeFormatted}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${iconColor}`} />
          <div>
            <div className={`text-xs font-medium ${textColor}`}>Duration</div>
            <div className={`text-sm ${currentTheme === 'black' ? 'text-white' : 'text-foreground'}`}>
              {daysRunning} day{daysRunning !== 1 ? 's' : ''}
            </div>
            <div className={`text-xs ${textColor}`}>
              running
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${iconColor}`} />
          <div>
            <div className={`text-xs font-medium ${textColor}`}>Applications</div>
            <div className={`text-sm ${currentTheme === 'black' ? 'text-white' : 'text-foreground'}`}>
              {applications.length}
            </div>
            <div className={`text-xs ${textColor}`}>
              received
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Eye className={`w-4 h-4 ${iconColor}`} />
          <div>
            <div className={`text-xs font-medium ${textColor}`}>Views</div>
            <div className={`text-sm ${currentTheme === 'black' ? 'text-white' : 'text-foreground'}`}>
              {viewCount}
            </div>
            <div className={`text-xs ${textColor}`}>
              total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
