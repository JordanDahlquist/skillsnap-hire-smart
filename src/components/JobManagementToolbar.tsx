
import { SearchBar } from "@/components/toolbar/SearchBar";
import { FilterDropdowns } from "@/components/toolbar/FilterDropdowns";
import { SortControls } from "@/components/toolbar/SortControls";
import { BulkActions } from "@/components/toolbar/BulkActions";
import { ToolbarStats } from "@/components/toolbar/ToolbarStats";

interface JobManagementToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalJobs: number;
  selectedJobs: string[];
  onBulkAction: (action: string) => void;
  onRefresh: () => void;
  locationFilter?: string;
  onLocationFilterChange?: (location: string) => void;
  workTypeFilter?: string;
  onWorkTypeFilterChange?: (workType: string) => void;
  needsAttentionFilter?: boolean;
  activeFiltersCount?: number;
}

export const JobManagementToolbar = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  totalJobs,
  selectedJobs,
  onBulkAction,
  onRefresh,
  workTypeFilter = 'all',
  onWorkTypeFilterChange = () => {},
  needsAttentionFilter = false,
  activeFiltersCount = 0
}: JobManagementToolbarProps) => {
  return (
    <div className="bg-white border-b border-gray-200 py-3 space-y-2">
      <div className="max-w-7xl mx-auto px-8">
        {/* Search and filters row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 items-center">
            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
            <FilterDropdowns
              statusFilter={statusFilter}
              onStatusFilterChange={onStatusFilterChange}
              workTypeFilter={workTypeFilter}
              onWorkTypeFilterChange={onWorkTypeFilterChange}
            />
          </div>
          
          <SortControls
            sortBy={sortBy}
            onSortChange={onSortChange}
            onRefresh={onRefresh}
          />
        </div>

        {/* Stats and bulk actions row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <ToolbarStats
            totalJobs={totalJobs}
            selectedCount={selectedJobs.length}
            activeFiltersCount={activeFiltersCount}
            needsAttentionFilter={needsAttentionFilter}
          />
          
          <BulkActions
            selectedCount={selectedJobs.length}
            onBulkAction={onBulkAction}
          />
        </div>
      </div>
    </div>
  );
};
