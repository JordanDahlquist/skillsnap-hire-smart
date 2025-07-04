
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TopPickBadge } from '@/components/ui/top-pick-badge';
import { Video } from 'lucide-react';
import { logger } from '@/services/loggerService';
import { renderManualRating, renderAIRating } from './utils/ratingUtils';
import { formatSubmissionDateTime } from '@/utils/dateUtils';
import { Application } from '@/types';

interface ApplicationItemProps {
  application: Application;
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  getStatusColor: (status: string, manualRating?: number | null) => string;
  getTimeAgo: (dateString: string) => string;
  selectedApplications?: string[];
  onSelectApplications?: (ids: string[]) => void;
  jobId?: string;
  isTopCandidate?: boolean;
}

// Helper function to check if application has video content
const hasVideoContent = (application: Application): boolean => {
  // Check for single interview video
  if (application.interview_video_url) {
    return true;
  }
  
  // Check for video responses in skills test
  const skillsResponses = Array.isArray(application.skills_test_responses) 
    ? application.skills_test_responses 
    : [];
  
  return skillsResponses.some((response: any) => 
    response?.video_url || response?.videoUrl || response?.answer_video_url
  );
};

export const ApplicationItem = memo(({ 
  application, 
  selectedApplication, 
  onSelectApplication, 
  getStatusColor,
  selectedApplications = [],
  onSelectApplications,
  isTopCandidate = false,
}: ApplicationItemProps) => {
  const navigate = useNavigate();

  const handleSelectApplication = useCallback((applicationId: string, checked: boolean) => {
    if (onSelectApplications) {
      if (checked) {
        onSelectApplications([...selectedApplications, applicationId]);
        logger.debug('Application selected', { applicationId });
      } else {
        onSelectApplications(selectedApplications.filter(id => id !== applicationId));
        logger.debug('Application deselected', { applicationId });
      }
    }
  }, [onSelectApplications, selectedApplications]);

  const handleApplicationClick = useCallback(() => {
    onSelectApplication(application);
    logger.debug('Application clicked for detail view', { applicationId: application.id });
  }, [onSelectApplication, application]);

  // Get the display status - if status is "reviewed" but no manual rating, show as "pending"
  const displayStatus = application.status === "reviewed" && !application.manual_rating ? "pending" : application.status;

  const isSelected = selectedApplication?.id === application.id;
  const hasVideo = hasVideoContent(application);

  return (
    <div className="mb-2">
      <div
        className={`consistent-card-shadow cursor-pointer p-2 transition-all duration-300 bg-card border border-border/50 rounded-lg ${
          isSelected 
            ? 'ring-2 ring-primary/50 shadow-lg scale-[1.01]' 
            : 'hover:scale-[1.005] hover:bg-card'
        }`}
        onClick={handleApplicationClick}
      >
        <div className="flex items-center gap-3">
          {onSelectApplications && (
            <Checkbox
              checked={selectedApplications.includes(application.id)}
              onCheckedChange={(checked) => handleSelectApplication(application.id, checked as boolean)}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              {/* Name and Email stacked vertically */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="text-sm font-medium text-foreground truncate">
                  {application.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {application.email}
                </div>
              </div>
              
              {/* Status, Top Pick, and Video badges */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge className={`${getStatusColor(application.status, application.manual_rating)} text-xs px-1.5 py-0.5`}>
                  {displayStatus}
                </Badge>
                {isTopCandidate && <TopPickBadge />}
                {hasVideo && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-blue-500/10 text-blue-400 rounded-full">
                    <Video className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Ratings and Date/Time in same row */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">You:</span>
                <div className="flex gap-0.5">
                  {renderManualRating(application.manual_rating)}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">AI:</span>
                <div className="flex gap-0.5">
                  {renderAIRating(application.ai_rating)}
                </div>
              </div>

              {/* Application submission date/time - right aligned */}
              <div className="ml-auto text-xs text-muted-foreground">
                {formatSubmissionDateTime(application.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicationItem.displayName = 'ApplicationItem';
