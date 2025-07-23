import React, { memo, useCallback, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SearchBar } from '@/components/toolbar/SearchBar';
import { BulkStageSelector } from './bulk-actions/BulkStageSelector';
import { Mail, X, ChevronDown, Star, StarOff, ArrowDownAZ, ArrowDownZA, ArrowUpDown, RotateCcw } from 'lucide-react';
import { logger } from '@/services/loggerService';

interface ApplicationsListHeaderProps {
  applicationsCount: number;
  selectedApplications: string[];
  onSelectApplications?: (ids: string[]) => void;
  applications: Array<{
    id: string;
    manual_rating?: number | null;
    status?: string;
    pipeline_stage?: string;
  }>;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onSendEmail?: () => void;
  onSetRating?: (rating: number | null) => void;
  onMoveToStage?: (stage: string) => void;
  onReject?: () => void;
  onUnreject?: () => void;
  jobId?: string;
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const SORT_OPTIONS = [
  { key: 'name-asc', sortBy: 'name', sortOrder: 'asc' as const, label: 'Name A-Z' },
  { key: 'name-desc', sortBy: 'name', sortOrder: 'desc' as const, label: 'Name Z-A' },
  { key: 'created-desc', sortBy: 'created_at', sortOrder: 'desc' as const, label: 'Newest First' },
  { key: 'created-asc', sortBy: 'created_at', sortOrder: 'asc' as const, label: 'Oldest First' },
  { key: 'rating-desc', sortBy: 'rating', sortOrder: 'desc' as const, label: 'Highest Rating' },
  { key: 'rating-asc', sortBy: 'rating', sortOrder: 'asc' as const, label: 'Lowest Rating' },
];

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
  onUnreject,
  jobId,
  isLoading = false,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortChange,
}: ApplicationsListHeaderProps) => {
  const [currentSortIndex, setCurrentSortIndex] = useState(() => {
    const currentKey = `${sortBy}-${sortOrder}`;
    const index = SORT_OPTIONS.findIndex(option => option.key === currentKey);
    return index >= 0 ? index : 2;
  });

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

  const handleSortCycle = useCallback(() => {
    if (!onSortChange) return;
    
    const nextIndex = (currentSortIndex + 1) % SORT_OPTIONS.length;
    const nextOption = SORT_OPTIONS[nextIndex];
    
    setCurrentSortIndex(nextIndex);
    onSortChange(nextOption.sortBy, nextOption.sortOrder);
    
    logger.debug('Sort option changed', {
      sortBy: nextOption.sortBy,
      sortOrder: nextOption.sortOrder,
      label: nextOption.label
    });
  }, [currentSortIndex, onSortChange]);

  const getCurrentSortLabel = useCallback(() => {
    return SORT_OPTIONS[currentSortIndex]?.label || 'Sort';
  }, [currentSortIndex]);

  const getCurrentSortIcon = useCallback(() => {
    const currentOption = SORT_OPTIONS[currentSortIndex];
    if (!currentOption) return ArrowUpDown;

    switch (currentOption.sortBy) {
      case 'name':
        return currentOption.sortOrder === 'asc' ? ArrowDownAZ : ArrowDownZA;
      case 'rating':
        return currentOption.sortOrder === 'desc' ? Star : StarOff;
      case 'created_at':
      default:
        return ArrowUpDown;
    }
  }, [currentSortIndex]);

  const handleRatingClick = useCallback((rating: number) => {
    if (!onSetRating) return;
    
    const selectedApps = applications.filter(app => selectedApplications.includes(app.id));
    const allHaveRating = selectedApps.length > 0 && selectedApps.every(app => app.manual_rating === rating);
    
    const newRating = allHaveRating ? null : rating;
    onSetRating(newRating);
  }, [onSetRating, applications, selectedApplications]);

  const isAllSelected = applicationsCount > 0 && selectedApplications.length === applicationsCount;
  const isSomeSelected = selectedApplications.length > 0 && selectedApplications.length < applicationsCount;
  const hasSelection = selectedApplications.length > 0;

  // Check if selected applications are rejected
  const selectedAppsData = applications.filter(app => selectedApplications.includes(app.id));
  const allSelectedAreRejected = selectedAppsData.length > 0 && selectedAppsData.every(app => 
    app.status === 'rejected' || app.pipeline_stage === 'rejected'
  );

  return (
    <TooltipProvider>
      <div className="p-5 border-b border-border rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-foreground">
            Applications ({applicationsCount})
          </h2>
        </div>

        {onSearchChange && (
          <div className="mb-3">
            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          </div>
        )}

        {hasSelection && onSelectApplications && (
          <div className="mb-2">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Button 
                size="sm"
                onClick={onSendEmail}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1 flex-shrink-0 h-7 px-2 text-xs"
              >
                <Mail className="w-3 h-3" />
                Email
              </Button>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[1, 2, 3].map((rating) => (
                  <Button
                    key={rating}
                    size="sm"
                    variant="outline"
                    onClick={() => handleRatingClick(rating)}
                    disabled={isLoading}
                    className="gap-1 hover:bg-accent hover:border-accent-foreground/20 border-border h-7 px-2 min-w-[2.5rem]"
                    title={`Set ${rating} star rating (click again to clear)`}
                  >
                    <span className="text-xs font-medium">{rating}</span>
                    <Star className="w-3 h-3 text-blue-500 fill-current" />
                  </Button>
                ))}
              </div>

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

              {allSelectedAreRejected && onUnreject ? (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={onUnreject}
                  disabled={isLoading}
                  className="gap-1 flex-shrink-0 h-7 px-2 text-xs border-green-200 text-green-700 hover:bg-green-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  Unreject
                </Button>
              ) : (
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
              )}
            </div>
          </div>
        )}

        {onSelectApplications && (
          <div className="flex items-center justify-between">
            {!hasSelection ? (
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

            {onSortChange && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSortCycle}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 flex-shrink-0"
                  >
                    {React.createElement(getCurrentSortIcon(), { 
                      className: `w-3 h-3 transition-transform ${
                        sortBy === 'created_at' && sortOrder === 'desc' ? 'rotate-180' : ''
                      }` 
                    })}
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="left" 
                  align="center"
                  sideOffset={4}
                  avoidCollisions={false}
                  collisionPadding={10}
                  className="z-[9999] bg-popover text-popover-foreground border shadow-lg whitespace-nowrap"
                >
                  <p className="text-xs">Sort: {getCurrentSortLabel()}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
});

ApplicationsListHeader.displayName = 'ApplicationsListHeader';
