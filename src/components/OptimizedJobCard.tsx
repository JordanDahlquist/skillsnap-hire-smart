
import { useState, memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useJobDescription } from "@/hooks/useJobDescription";
import { useJobActions } from "@/hooks/useJobActions";
import { useViewTracking } from "@/hooks/useViewTracking";
import { useThemeContext } from "@/contexts/ThemeContext";
import { JobCardHeader } from "./job-card/JobCardHeader";
import { JobCardDetails } from "./job-card/JobCardDetails";
import { JobCardActions } from "./job-card/JobCardActions";
import { UnifiedJobCreatorPanel } from "./UnifiedJobCreatorPanel";
import { Job } from "@/types";

interface OptimizedJobCardProps {
  job: Job;
  onJobUpdate: () => void;
  getTimeAgo: (dateString: string) => string;
  isSelected?: boolean;
  onJobSelection?: (checked: boolean) => void;
}

// Helper function to get application count consistently
const getApplicationCount = (job: Job): number => {
  // Use applicationStatusCounts.total first, then fallback to applications array
  if (job.applicationStatusCounts?.total !== undefined) {
    return job.applicationStatusCounts.total;
  }
  
  // Fallback to applications array count
  if (job.applications && Array.isArray(job.applications)) {
    return job.applications.length;
  }
  
  // Last fallback to applications[0].count if it exists
  if (job.applications?.[0]?.count !== undefined) {
    return job.applications[0].count;
  }
  
  return 0;
};

export const OptimizedJobCard = memo(({ 
  job, 
  onJobUpdate, 
  getTimeAgo,
  isSelected = false,
  onJobSelection
}: OptimizedJobCardProps) => {
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const { currentTheme } = useThemeContext();
  
  // Track views when card is rendered
  useViewTracking(job.id, true);
  
  const needsAttention = useMemo(() => 
    (job.applicationStatusCounts?.pending || 0) >= 10,
    [job.applicationStatusCounts?.pending]
  );
  
  const applicationsCount = useMemo(() => getApplicationCount(job), [job]);
  
  const { isGeneratingDescription, getDisplayDescription } = useJobDescription(job, onJobUpdate);
  const { isUpdating, handleStatusChange, handleDuplicateJob, handleArchiveJob } = useJobActions(job, onJobUpdate);

  const getLocationDisplay = useCallback(() => {
    const { location_type, country, state, region, city } = job;
    
    if (location_type === 'remote') {
      return country ? `Remote (${country})` : 'Remote';
    }
    
    if (country === 'United States' && state) {
      const parts = [city, state, region].filter(Boolean);
      return parts.join(', ');
    }
    
    if (country) {
      const parts = [city, country].filter(Boolean);
      return parts.join(', ');
    }
    
    return location_type ? location_type.charAt(0).toUpperCase() + location_type.slice(1) : 'Not specified';
  }, [job]);

  const handleEditPanelOpen = useCallback(() => {
    setIsEditPanelOpen(true);
  }, []);

  const handleEditPanelClose = useCallback(() => {
    setIsEditPanelOpen(false);
  }, []);

  const handleJobUpdated = useCallback(() => {
    onJobUpdate();
    setIsEditPanelOpen(false);
  }, [onJobUpdate]);

  // Theme-aware text colors
  const textColor = currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const subtleTextColor = currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      <Card className="group glass-card-no-hover">
        <CardHeader>
          <JobCardHeader 
            job={job} 
            needsAttention={needsAttention}
            status={job.status}
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating}
            applicationsCount={applicationsCount}
            isSelected={isSelected}
            onJobSelection={onJobSelection}
          />
          
          <JobCardDetails 
            job={job} 
            getLocationDisplay={getLocationDisplay}
            getTimeAgo={getTimeAgo}
            applicationsCount={applicationsCount}
          />
          
          <div className="mb-3">
            {isGeneratingDescription ? (
              <div className={`flex items-center gap-2 ${subtleTextColor}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating AI description...</span>
              </div>
            ) : (
              <p className={`line-clamp-2 ${textColor}`}>{getDisplayDescription()}</p>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <JobCardActions 
            jobId={job.id}
            onEdit={handleEditPanelOpen}
            onDuplicate={handleDuplicateJob}
            onArchive={handleArchiveJob}
          />
        </CardContent>
      </Card>

      <UnifiedJobCreatorPanel
        open={isEditPanelOpen}
        onOpenChange={handleEditPanelClose}
        onJobCreated={handleJobUpdated}
        editingJob={job}
      />
    </>
  );
});

OptimizedJobCard.displayName = 'OptimizedJobCard';
