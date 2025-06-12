
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
import { Mail, X, ChevronDown, Star } from 'lucide-react';
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
    <div className="p-4 border-b border-border glass-card-no-hover">
      {/* Applications Title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-foreground">
          Applications ({applicationsCount})
        </h2>
      </div>

      {/* Search Bar */}
      {onSearchChange && (
        <div className="mb-3">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
        </div>
      )}

      {/* Bulk Actions Row (when items selected) */}
      {hasSelection && onSelectApplications && (
        <div className="mb-2">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {/* Email Button */}
            <Button 
              size="sm"
              onClick={onSendEmail}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1 flex-shrink-0 h-7 px-2 text-xs"
            >
              <Mail className="w-3 h-3" />
              Email
            </Button>

            {/* Rating Buttons Group */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {[1, 2, 3].map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  variant="outline"
                  onClick={() => onSetRating?.(rating)}
                  disabled={isLoading}
                  className="gap-1 hover:bg-accent hover:border-accent-foreground/20 border-border h-7 px-2 min-w-[2.5rem]"
                  title={`Set ${rating} star rating`}
                >
                  <span className="text-xs font-medium">{rating}</span>
                  <Star className="w-3 h-3 text-blue-500 fill-current" />
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
                    className="gap-1 flex-shrink-0 h-7 px-2 text-xs"
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
              className="gap-1 flex-shrink-0 h-7 px-2 text-xs"
            >
              <X className="w-3 h-3" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Selection Controls Row */}
      {onSelectApplications && (
        <div className="flex items-center justify-between">
          {!hasSelection ? (
            // Select All Checkbox (when no selection)
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={isAllSelected} 
                onCheckedChange={handleSelectAll}
                className={`${isSomeSelected ? "data-[state=checked]:bg-blue-600" : ""} w-4 h-4`}
              />
              <span className="text-sm text-muted-foreground">
                Select All Applications
              </span>
            </div>
          ) : (
            // Selection Count and Clear (when items selected)
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
                {selectedApplications.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ApplicationsListHeader.displayName = 'ApplicationsListHeader';
