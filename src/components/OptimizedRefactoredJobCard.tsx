
import { useState, memo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EditJobModal } from "./EditJobModal";
import { useJobDescription } from "@/hooks/useJobDescription";
import { useJobActions } from "@/hooks/useJobActions";
import { JobCardHeader } from "./job-card/JobCardHeader";
import { JobCardDetails } from "./job-card/JobCardDetails";
import { JobCardActions } from "./job-card/JobCardActions";
import { JobCardStatus } from "./job-card/JobCardStatus";
import { Job } from "@/types";
import { logger } from "@/services/loggerService";

interface OptimizedRefactoredJobCardProps {
  job: Job;
  onJobUpdate: () => void;
  getTimeAgo: (dateString: string) => string;
}

export const OptimizedRefactoredJobCard = memo(({ 
  job, 
  onJobUpdate, 
  getTimeAgo 
}: OptimizedRefactoredJobCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const needsAttention = (job.applicationStatusCounts?.pending || 0) >= 10;
  const applicationsCount = job.applications?.[0]?.count || 0;
  
  const { isGeneratingDescription, getDisplayDescription } = useJobDescription(job, onJobUpdate);
  const { isUpdating, handleStatusChange, handleDuplicateJob, handleArchiveJob } = useJobActions(job, onJobUpdate);

  const getLocationDisplay = useCallback(() => {
    const { location_type, country, state, region, city } = job;
    
    if (location_type === 'remote') {
      if (country) {
        return `Remote (${country})`;
      }
      return 'Remote';
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

  const handleEditModalOpen = useCallback(() => {
    logger.debug('Opening edit modal for job:', job.id);
    setIsEditModalOpen(true);
  }, [job.id]);

  const handleEditModalClose = useCallback(() => {
    logger.debug('Closing edit modal for job:', job.id);
    setIsEditModalOpen(false);
  }, [job.id]);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <JobCardHeader job={job} needsAttention={needsAttention} />
          
          <JobCardDetails 
            job={job} 
            getLocationDisplay={getLocationDisplay}
            getTimeAgo={getTimeAgo}
            applicationsCount={applicationsCount}
          />
          
          <div className="mb-3">
            {isGeneratingDescription ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating AI description...</span>
              </div>
            ) : (
              <p className="text-gray-700 line-clamp-2">{getDisplayDescription()}</p>
            )}
          </div>
          
          <JobCardStatus 
            status={job.status}
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating}
            applicationsCount={applicationsCount}
            needsAttention={needsAttention}
          />
        </CardHeader>
        
        <CardContent>
          <JobCardActions 
            jobId={job.id}
            onEdit={handleEditModalOpen}
            onDuplicate={handleDuplicateJob}
            onArchive={handleArchiveJob}
          />
        </CardContent>
      </Card>

      <EditJobModal
        open={isEditModalOpen}
        onOpenChange={handleEditModalClose}
        job={job}
        onJobUpdate={onJobUpdate}
      />
    </>
  );
});

OptimizedRefactoredJobCard.displayName = 'OptimizedRefactoredJobCard';
