
import React, { memo, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        selectedApplication?.id === application.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
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
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {application.name}
              </h3>
              <span className="text-xs text-gray-500">
                {getTimeAgo(application.created_at)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 truncate mb-2">
              {application.email}
            </p>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(application.status, application.manual_rating)}>
                  {displayStatus}
                </Badge>
              </div>
              
              {/* Stage Selector */}
              {jobId && (
                <div onClick={(e) => e.stopPropagation()}>
                  <StageSelector
                    jobId={jobId}
                    currentStage={application.pipeline_stage}
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
                  <span className="text-xs text-gray-500">Your:</span>
                  <div className="flex gap-0.5">
                    {renderManualRating(application.manual_rating)}
                  </div>
                </div>
                
                {/* AI Rating */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">AI:</span>
                  <div className="flex gap-0.5">
                    {renderAIRating(application.ai_rating)}
                  </div>
                </div>
              </div>
            </div>
            
            {application.ai_summary && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {application.ai_summary}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicationItem.displayName = 'ApplicationItem';
