
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Video } from 'lucide-react';
import { StageSelector } from './StageSelector';
import { logger } from '@/services/loggerService';
import { renderManualRating, renderAIRating } from './utils/ratingUtils';
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
  getTimeAgo,
  selectedApplications = [],
  onSelectApplications,
  jobId
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

  const handleViewFullProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (jobId) {
      navigate(`/dashboard/${jobId}/candidate/${application.id}`);
      logger.debug('Navigating to candidate detail page', { 
        jobId, 
        applicationId: application.id 
      });
    }
  }, [navigate, jobId, application.id]);

  const handleVideoIndicatorClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (jobId) {
      navigate(`/dashboard/${jobId}/candidate/${application.id}`);
      logger.debug('Navigating to candidate detail page via video indicator', { 
        jobId, 
        applicationId: application.id 
      });
    }
  }, [navigate, jobId, application.id]);

  // Get the display status - if status is "reviewed" but no manual rating, show as "pending"
  const displayStatus = application.status === "reviewed" && !application.manual_rating ? "pending" : application.status;

  // Ensure pipeline_stage defaults to "applied" if null or undefined
  const pipelineStage = application.pipeline_stage || 'applied';

  const isSelected = selectedApplication?.id === application.id;
  const hasVideo = hasVideoContent(application);

  return (
    <div className="mb-4">
      <div
        className={`glass-card cursor-pointer p-4 transition-all duration-300 ${
          isSelected 
            ? 'ring-2 ring-primary/50 shadow-lg scale-[1.02]' 
            : 'hover:scale-[1.01]'
        }`}
        onClick={handleApplicationClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {onSelectApplications && (
              <Checkbox
                checked={selectedApplications.includes(application.id)}
                onCheckedChange={(checked) => handleSelectApplication(application.id, checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {application.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {getTimeAgo(application.created_at)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground truncate mb-2">
                {application.email}
              </p>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(application.status, application.manual_rating)}>
                    {displayStatus}
                  </Badge>
                  {hasVideo && (
                    <button
                      onClick={handleVideoIndicatorClick}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                      title="Has video interview"
                    >
                      <Video className="w-3 h-3" />
                      Video
                    </button>
                  )}
                </div>
                
                {/* Stage Selector */}
                {jobId && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <StageSelector
                      jobId={jobId}
                      currentStage={pipelineStage}
                      applicationId={application.id}
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Rating Section */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                  {/* Manual Rating */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Your:</span>
                    <div className="flex gap-0.5">
                      {renderManualRating(application.manual_rating)}
                    </div>
                  </div>
                  
                  {/* AI Rating */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">AI:</span>
                    <div className="flex gap-0.5">
                      {renderAIRating(application.ai_rating)}
                    </div>
                  </div>
                </div>

                {/* View Full Profile Button */}
                {jobId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewFullProfile}
                    className="ml-2 flex items-center gap-1 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Full
                  </Button>
                )}
              </div>
              
              {application.ai_summary && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {application.ai_summary}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicationItem.displayName = 'ApplicationItem';
