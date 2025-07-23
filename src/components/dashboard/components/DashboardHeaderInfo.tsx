
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { Job, Application } from "@/types";
import { useThemeContext } from "@/contexts/ThemeContext";
import { FullWidthInsightsBar } from "./FullWidthInsightsBar";

interface DashboardHeaderInfoProps {
  job: Job;
  applications: Application[];
  getTimeAgo: (dateString: string) => string;
}

export const DashboardHeaderInfo = ({ job, applications, getTimeAgo }: DashboardHeaderInfoProps) => {
  const { currentTheme } = useThemeContext();
  const [showMetadata, setShowMetadata] = useState(false);
  
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

  // Theme-aware colors
  const titleColor = currentTheme === 'black' ? 'text-white' : 'text-foreground';
  const subtleTextColor = currentTheme === 'black' ? 'text-gray-300' : 'text-muted-foreground';

  return (
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-1">
        <h1 className={`text-xl font-semibold ${titleColor}`}>{job.title}</h1>
        <Badge className={getStatusBadgeClasses(job.status)}>
          {job.status}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-3 text-sm ${subtleTextColor}`}>
          <span>{applications.length} applications</span>
          <span>•</span>
          <span>Started {getTimeAgo(job.created_at)}</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMetadata(!showMetadata)}
          className={`h-7 px-2 gap-1 ${subtleTextColor} hover:text-foreground`}
        >
          <BarChart3 className="w-3 h-3" />
          <span className="text-xs">Insights</span>
          {showMetadata ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      </div>

      <FullWidthInsightsBar 
        job={job} 
        applications={applications} 
        isVisible={showMetadata} 
      />
    </div>
  );
};
