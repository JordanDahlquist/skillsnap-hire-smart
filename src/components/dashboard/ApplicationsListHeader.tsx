
import React, { memo, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchBar } from '@/components/toolbar/SearchBar';
import { logger } from '@/services/loggerService';

interface ApplicationsListHeaderProps {
  applicationsCount: number;
  selectedApplications: string[];
  onSelectApplications?: (ids: string[]) => void;
  applications: Array<{
    id: string;
  }>;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const ApplicationsListHeader = memo(({
  applicationsCount,
  selectedApplications,
  onSelectApplications,
  applications,
  searchTerm = '',
  onSearchChange,
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

  const isAllSelected = applicationsCount > 0 && selectedApplications.length === applicationsCount;
  const isSomeSelected = selectedApplications.length > 0 && selectedApplications.length < applicationsCount;

  return (
    <div className="p-6 border-b border-gray-200 bg-white">
      {/* Applications Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Applications ({applicationsCount})
        </h2>
      </div>

      {/* Search Bar */}
      {onSearchChange && (
        <div className="mb-4">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
        </div>
      )}

      {/* Select All Checkbox */}
      {onSelectApplications && (
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={isAllSelected} 
            onCheckedChange={handleSelectAll}
            className={`${isSomeSelected ? "data-[state=checked]:bg-blue-600" : ""} w-5 h-5`}
          />
          <span className="text-sm font-medium text-gray-700">
            Select All Applications
            {selectedApplications.length > 0 && (
              <span className="ml-2 text-blue-600">
                ({selectedApplications.length} selected)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
});

ApplicationsListHeader.displayName = 'ApplicationsListHeader';
