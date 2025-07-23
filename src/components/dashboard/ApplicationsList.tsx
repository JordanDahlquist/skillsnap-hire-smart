import React, { memo, useMemo } from 'react';
import { ApplicationsListHeader } from './ApplicationsListHeader';
import { ApplicationItem } from './ApplicationItem';
import { Application } from '@/types';
import { calculateTopCandidates } from '@/utils/topCandidateUtils';

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
  onUnreject?: () => void;
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
  onUnreject,
  jobId,
  isLoading = false,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortChange,
}: ApplicationsListProps) => {
  // Calculate top candidates based on AI ratings
  const topCandidateIds = useMemo(() => {
    return calculateTopCandidates(applications);
  }, [applications]);

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
          case 'ai_rating':
            // Sort by AI rating specifically, with null values at the end
            const aiRatingA = a.ai_rating || 0;
            const aiRatingB = b.ai_rating || 0;
            comparison = aiRatingA - aiRatingB;
            break;
          default:
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    } else {
      // Default sorting: AI-rated candidates first (by AI rating desc), then by creation date desc
      filtered = [...filtered].sort((a, b) => {
        // Prioritize applications with AI ratings
        const aHasAI = a.ai_rating !== null && a.ai_rating !== undefined;
        const bHasAI = b.ai_rating !== null && b.ai_rating !== undefined;
        
        if (aHasAI && !bHasAI) return -1;
        if (!aHasAI && bHasAI) return 1;
        
        if (aHasAI && bHasAI) {
          // Both have AI ratings, sort by AI rating desc
          return (b.ai_rating || 0) - (a.ai_rating || 0);
        }
        
        // Neither has AI rating, sort by creation date desc
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return filtered;
  }, [applications, searchTerm, sortBy, sortOrder, onSortChange]);

  return (
    <div className="bg-card border border-border rounded-lg">
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
        onUnreject={onUnreject}
        jobId={jobId}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />

      <div 
        className="overflow-y-auto relative rounded-b-lg"
        style={{ 
          height: '750px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)'
        }}
      >
        <div className="py-2 px-5">
          {processedApplications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-lg font-medium mb-2 text-foreground">
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
                isTopCandidate={topCandidateIds.has(application.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

ApplicationsList.displayName = 'ApplicationsList';
