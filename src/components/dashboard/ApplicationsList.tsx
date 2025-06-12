
import React, { memo, useMemo } from 'react';
import { ApplicationsListHeader } from './ApplicationsListHeader';
import { ApplicationItem } from './ApplicationItem';
import { Application } from '@/types';

interface ApplicationsListProps {
  applications: Application[];
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  getStatusColor: (status: string, manualRating?: number | null) => string;
  getTimeAgo: (dateString: string) => string;
  selectedApplications?: string[];
  onSelectApplications?: (ids: string[]) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  // Bulk action props
  onSendEmail?: () => void;
  onSetRating?: (rating: number) => void;
  onMoveToStage?: (stage: string) => void;
  onReject?: () => void;
  jobId?: string;
  isLoading?: boolean;
}

export const ApplicationsList = memo(({
  applications,
  selectedApplication,
  onSelectApplication,
  getStatusColor,
  getTimeAgo,
  selectedApplications = [],
  onSelectApplications,
  searchTerm = '',
  onSearchChange,
  onSendEmail,
  onSetRating,
  onMoveToStage,
  onReject,
  jobId,
  isLoading = false,
}: ApplicationsListProps) => {
  // Filter applications based on search term
  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) {
      return applications;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return applications.filter(application => 
      application.name.toLowerCase().includes(searchLower) ||
      application.email.toLowerCase().includes(searchLower)
    );
  }, [applications, searchTerm]);

  return (
    <div className="glass-card">
      <ApplicationsListHeader
        applicationsCount={filteredApplications.length}
        selectedApplications={selectedApplications}
        onSelectApplications={onSelectApplications}
        applications={filteredApplications}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onSendEmail={onSendEmail}
        onSetRating={onSetRating}
        onMoveToStage={onMoveToStage}
        onReject={onReject}
        jobId={jobId}
        isLoading={isLoading}
      />

      <div className="relative pt-4">
        <div className="overflow-y-auto applications-list-viewport" style={{ height: '750px' }}>
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-lg font-medium mb-2">
                {searchTerm ? 'No candidates found' : 'No applications yet'}
              </div>
              <div className="text-sm">
                {searchTerm ? 'Try adjusting your search terms.' : 'Applications will appear here once candidates apply.'}
              </div>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationItem
                key={application.id}
                application={application}
                selectedApplication={selectedApplication}
                onSelectApplication={onSelectApplication}
                getStatusColor={getStatusColor}
                getTimeAgo={getTimeAgo}
                selectedApplications={selectedApplications}
                onSelectApplications={onSelectApplications}
                jobId={jobId}
              />
            ))
          )}
        </div>
        
        {/* Top fade overlay - deeper and more intense */}
        <div className="absolute top-4 left-0 right-0 h-10 bg-gradient-to-b from-background/95 via-background/60 to-transparent pointer-events-none z-10" />
        
        {/* Bottom fade overlay - deeper and more intense */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background/95 via-background/60 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
});

ApplicationsList.displayName = 'ApplicationsList';
