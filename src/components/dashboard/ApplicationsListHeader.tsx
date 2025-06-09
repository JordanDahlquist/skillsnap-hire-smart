
import React, { memo, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { SearchBar } from '@/components/toolbar/SearchBar';
import { BulkStageSelector } from './bulk-actions/BulkStageSelector';
import { Mail, X, ChevronDown } from 'lucide-react';
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
  // Bulk action props
  onSendEmail?: () => void;
  onSetRating?: (rating: number) => void;
  onMoveToStage?: (stage: string) => void;
  onReject?: () => void;
  jobId?: string;
  isLoading?: boolean;
}

export const ApplicationsListHeader = memo(({
  applicationsCount,
  selectedApplications,
  onSelectApplications,
  applications,
  searchTerm = '',
  onSearchChange,
  onSendEmail,
  onSetRating,
  onMoveToStage,
  onReject,
  jobId,
  isLoading = false,
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
    }
  }, [onSelectApplications]);

  const isAllSelected = applicationsCount > 0 && selectedApplications.length === applicationsCount;
  const isSomeSelected = selectedApplications.length > 0 && selectedApplications.length < applicationsCount;
  const hasSelection = selectedApplications.length > 0;

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

      {/* Selection Controls / Bulk Actions */}
      {onSelectApplications && (
        <div className="flex items-center justify-between">
          {!hasSelection ? (
            // Select All Checkbox (when no selection)
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isAllSelected} 
                onCheckedChange={handleSelectAll}
                className={`${isSomeSelected ? "data-[state=checked]:bg-blue-600" : ""} w-5 h-5`}
              />
              <span className="text-sm font-medium text-gray-700">
                Select All Applications
              </span>
            </div>
          ) : (
            // Bulk Actions (when items selected)
            <>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm font-medium">
                  {selectedApplications.length} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Email Button */}
                <Button 
                  size="sm"
                  onClick={onSendEmail}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>

                {/* Rating Buttons */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((rating) => (
                    <Button
                      key={rating}
                      size="sm"
                      variant="outline"
                      onClick={() => onSetRating?.(rating)}
                      disabled={isLoading}
                      className="gap-1 hover:bg-yellow-50 hover:border-yellow-300"
                      title={`Set ${rating} star rating`}
                    >
                      <span className="text-sm">{rating}</span>
                      <span className="text-yellow-400">⭐</span>
                    </Button>
                  ))}
                </div>

                {/* Stage Dropdown */}
                {jobId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isLoading} 
                        className="gap-2"
                      >
                        Stage
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <BulkStageSelector 
                        jobId={jobId} 
                        onStageChange={onMoveToStage}
                        disabled={isLoading}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Reject Button */}
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={onReject}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

ApplicationsListHeader.displayName = 'ApplicationsListHeader';
