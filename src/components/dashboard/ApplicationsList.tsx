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
  // New sorting props
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
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
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortChange,
}: ApplicationsListProps) => {
  // Filter and sort applications based on search term and sort options
  const processedApplications = useMemo(() => {
    // First filter by search term
    let filtered = applications;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = applications.filter(application => 
        application.name.toLowerCase().includes(searchLower) ||
        application.email.toLowerCase().includes(searchLower)
      );
    }

    // Then sort the filtered results
    if (onSortChange) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case 'rating':
            const ratingA = a.manual_rating || a.ai_rating || 0;
            const ratingB = b.manual_rating || b.ai_rating || 0;
            comparison = ratingA - ratingB;
            break;
          default:
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [applications, searchTerm, sortBy, sortOrder, onSortChange]);

  return (
    <div>
      <div className="glass-card mb-2">
        <ApplicationsListHeader
          applicationsCount={processedApplications.length}
          selectedApplications={selectedApplications}
          onSelectApplications={onSelectApplications}
          applications={processedApplications}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onSendEmail={onSendEmail}
          onSetRating={onSetRating}
          onMoveToStage={onMoveToStage}
          onReject={onReject}
          jobId={jobId}
          isLoading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      </div>

      {/* Mobile optimized scrollable area */}
      <div 
        className="overflow-y-auto relative"
        style={{ 
          height: window.innerWidth < 1024 ? 'calc(100vh - 280px)' : '750px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)'
        }}
      >
        <div className="py-2 px-1 lg:px-3">
          {processedApplications.length === 0 ? (
            <div className="p-4 lg:p-8 text-center">
              <div className="text-base lg:text-lg font-medium mb-2 text-foreground">
                {searchTerm ? 'No candidates found' : 'No applications yet'}
              </div>
              <div className="text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Applications will appear here once candidates apply.'}
              </div>
            </div>
          ) : (
            processedApplications.map((application) => (
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
      </div>
    </div>
  );
});

ApplicationsList.displayName = 'ApplicationsList';
