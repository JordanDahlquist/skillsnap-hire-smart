
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
      <ApplicationsListHeader
        applicationsCount={filteredApplications.length}
        selectedApplications={selectedApplications}
        onSelectApplications={onSelectApplications}
        applications={filteredApplications}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      <div className="divide-y divide-gray-200 overflow-y-auto" style={{ height: 'calc(100vh - 350px)' }}>
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
            />
          ))
        )}
      </div>
    </div>
  );
});

ApplicationsList.displayName = 'ApplicationsList';
