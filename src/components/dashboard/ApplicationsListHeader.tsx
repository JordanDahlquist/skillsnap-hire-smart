
import React, { memo, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { SearchBar } from '@/components/toolbar/SearchBar';
import { logger } from '@/services/loggerService';

interface ApplicationsListHeaderProps {
  applicationsCount: number;
  selectedApplications: string[];
  onSelectApplications?: (ids: string[]) => void;
  onSendEmail?: () => void;
  applications: Array<{ id: string }>;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const ApplicationsListHeader = memo(({
  applicationsCount,
  selectedApplications,
  onSelectApplications,
  onSendEmail,
  applications,
  searchTerm = '',
  onSearchChange
}: ApplicationsListHeaderProps) => {
  const handleSelectAll = useCallback((checked: boolean) => {
    if (onSelectApplications) {
      const newSelection = checked ? applications.map(app => app.id) : [];
      onSelectApplications(newSelection);
      logger.info(`${checked ? 'Selected' : 'Deselected'} all applications`, { count: applicationsCount });
    }
  }, [onSelectApplications, applications, applicationsCount]);

  const handleSendEmail = useCallback(() => {
    if (onSendEmail) {
      logger.info('Bulk email action triggered', { selectedCount: selectedApplications.length });
      onSendEmail();
    }
  }, [onSendEmail, selectedApplications.length]);

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
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
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
      
      {/* Selected Applications Action Bar */}
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
  );
});

ApplicationsListHeader.displayName = 'ApplicationsListHeader';
