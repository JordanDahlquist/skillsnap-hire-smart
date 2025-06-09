
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
  onSendEmail?: () => void;
  jobId?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const ApplicationsList = memo(({
  applications,
  selectedApplication,
  onSelectApplication,
  getStatusColor,
  getTimeAgo,
  selectedApplications = [],
  onSelectApplications,
  onSendEmail,
  jobId,
  searchTerm = '',
  onSearchChange
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
    <div className="bg-white rounded-lg border border-gray-200">
      <ApplicationsListHeader
        applicationsCount={filteredApplications.length}
        selectedApplications={selectedApplications}
        onSelectApplications={onSelectApplications}
        onSendEmail={onSendEmail}
        applications={filteredApplications}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredApplications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No candidates found matching your search.' : 'No applications in this stage yet.'}
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
    </div>
  );
});

ApplicationsList.displayName = 'ApplicationsList';
