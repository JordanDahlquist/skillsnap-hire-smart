
import React, { memo, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchBar } from '@/components/toolbar/SearchBar';
import { CompactBulkActions } from './bulk-actions';
import { logger } from '@/services/loggerService';

interface ApplicationsListHeaderProps {
  applicationsCount: number;
  selectedApplications: string[];
  onSelectApplications?: (ids: string[]) => void;
  onSendEmail?: () => void;
  onBulkUpdateStatus?: (status: string) => void;
  onBulkSetRating?: (rating: number) => void;
  onBulkMoveToStage?: (stage: string) => void;
  onBulkExport?: () => void;
  onBulkReject?: () => void;
  applications: Array<{
    id: string;
  }>;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  jobId?: string;
  isLoading?: boolean;
}

export const ApplicationsListHeader = memo(({
  applicationsCount,
  selectedApplications,
  onSelectApplications,
  onSendEmail,
  onBulkUpdateStatus,
  onBulkSetRating,
  onBulkMoveToStage,
  onBulkExport,
  onBulkReject,
  applications,
  searchTerm = '',
  onSearchChange,
  jobId,
  isLoading = false
}: ApplicationsListHeaderProps) => {
  const handleSelectAll = useCallback((checked: boolean) => {
    if (onSelectApplications) {
      const newSelection = checked ? applications.map(app => app.id) : [];
      onSelectApplications(newSelection);
      logger.info(`${checked ? 'Selected' : 'Deselected'} all applications`, {
        count: applicationsCount
      });
    }
  }, [onSelectApplications, applications, applicationsCount]);

  const handleClearSelection = useCallback(() => {
    if (onSelectApplications) {
      onSelectApplications([]);
      logger.info('Cleared application selection');
    }
  }, [onSelectApplications]);

  const isAllSelected = applicationsCount > 0 && selectedApplications.length === applicationsCount;
  const isSomeSelected = selectedApplications.length > 0 && selectedApplications.length < applicationsCount;

  return (
    <div className="p-4 border-b border-gray-200">
      {/* Applications Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Applications ({applicationsCount})
      </h2>

      {/* Search Bar */}
      {onSearchChange && (
        <div className="mb-3">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
        </div>
      )}

      {/* Select All Checkbox */}
      {onSelectApplications && (
        <div className="flex items-center gap-2 mb-3">
          <Checkbox 
            checked={isAllSelected} 
            onCheckedChange={handleSelectAll}
            className={isSomeSelected ? "data-[state=checked]:bg-blue-600" : ""}
          />
          <span className="text-sm text-gray-600">Select All</span>
        </div>
      )}

      {/* Compact Bulk Actions */}
      {jobId && (
        <CompactBulkActions
          selectedCount={selectedApplications.length}
          onSendEmail={onSendEmail || (() => {})}
          onSetRating={onBulkSetRating || (() => {})}
          onMoveToStage={onBulkMoveToStage || (() => {})}
          onReject={onBulkReject || (() => {})}
          onClearSelection={handleClearSelection}
          jobId={jobId}
          isLoading={isLoading}
        />
      )}
    </div>
  );
});

ApplicationsListHeader.displayName = 'ApplicationsListHeader';
