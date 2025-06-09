
import React, { memo } from 'react';
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
  jobId
}: ApplicationsListProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <ApplicationsListHeader
        applicationsCount={applications.length}
        selectedApplications={selectedApplications}
        onSelectApplications={onSelectApplications}
        onSendEmail={onSendEmail}
        applications={applications}
      />

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {applications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No applications in this stage yet.
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
              jobId={jobId}
            />
          ))
        )}
      </div>
    </div>
  );
});

ApplicationsList.displayName = 'ApplicationsList';
