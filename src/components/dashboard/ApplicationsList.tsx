
import React, { memo, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Star } from 'lucide-react';
import { logger } from '@/services/loggerService';

interface Application {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  created_at: string;
  ai_rating: number | null;
  ai_summary: string | null;
  status: string;
  experience: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
  manual_rating: number | null;
  rejection_reason: string | null;
}

interface ApplicationsListProps {
  applications: Application[];
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  getStatusColor: (status: string) => string;
  getTimeAgo: (dateString: string) => string;
  selectedApplications?: string[];
  onSelectApplications?: (ids: string[]) => void;
  onSendEmail?: () => void;
}

const ApplicationItem = memo(({ 
  application, 
  selectedApplication, 
  onSelectApplication, 
  getStatusColor, 
  getTimeAgo,
  selectedApplications = [],
  onSelectApplications
}: {
  application: Application;
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  getStatusColor: (status: string) => string;
  getTimeAgo: (dateString: string) => string;
  selectedApplications?: string[];
  onSelectApplications?: (ids: string[]) => void;
}) => {
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

  const renderManualRating = (rating: number | null) => {
    if (!rating) {
      return Array.from({ length: 3 }, (_, i) => (
        <Star key={i} className="w-4 h-4 text-gray-300" />
      ));
    }

    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= rating;
      
      return (
        <Star
          key={i}
          className={`w-4 h-4 ${
            isActive ? 'text-blue-500 fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const renderAIRating = (rating: number | null) => {
    if (!rating) {
      return Array.from({ length: 3 }, (_, i) => (
        <Star key={i} className="w-4 h-4 text-gray-300" />
      ));
    }

    // Convert 5-star AI rating to 3-star scale
    const convertedRating = (rating / 5) * 3;
    
    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= Math.round(convertedRating);
      
      return (
        <Star
          key={i}
          className={`w-4 h-4 ${
            isActive ? 'text-green-500 fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
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

export const ApplicationsList = memo(({
  applications,
  selectedApplication,
  onSelectApplication,
  getStatusColor,
  getTimeAgo,
  selectedApplications = [],
  onSelectApplications,
  onSendEmail
}: ApplicationsListProps) => {
  const handleSelectAll = useCallback((checked: boolean) => {
    if (onSelectApplications) {
      const newSelection = checked ? applications.map(app => app.id) : [];
      onSelectApplications(newSelection);
      logger.info(`${checked ? 'Selected' : 'Deselected'} all applications`, { count: applications.length });
    }
  }, [onSelectApplications, applications]);

  const handleSendEmail = useCallback(() => {
    if (onSendEmail) {
      logger.info('Bulk email action triggered', { selectedCount: selectedApplications.length });
      onSendEmail();
    }
  }, [onSendEmail, selectedApplications.length]);

  const isAllSelected = applications.length > 0 && selectedApplications.length === applications.length;
  const isSomeSelected = selectedApplications.length > 0 && selectedApplications.length < applications.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Applications ({applications.length})
          </h2>
          {onSelectApplications && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isSomeSelected ? "data-[state=checked]:bg-blue-600" : ""}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          )}
        </div>
        
        {selectedApplications.length > 0 && onSendEmail && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700">
              {selectedApplications.length} candidate{selectedApplications.length > 1 ? 's' : ''} selected
            </span>
            <Button size="sm" onClick={handleSendEmail}>
              <Mail className="w-4 h-4 mr-1" />
              Send Email
            </Button>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {applications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No applications yet for this job.
          </div>
        ) : (
          applications.map((application) => (
            <ApplicationItem
              key={application.id}
              application={application}
              selectedApplication={selectedApplication}
              onSelectApplication={onSelectApplication}
              getStatusColor={getStatusColor}
              getTimeAgo={getTimeAgo}
              selectedApplications={selectedApplications}
              onSelectApplications={onSelectApplications}
            />
          ))
        )}
      </div>
    </div>
  );
});

ApplicationsList.displayName = 'ApplicationsList';
