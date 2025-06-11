
import { SearchBar } from "@/components/toolbar/SearchBar";
import { FilterDropdowns } from "@/components/toolbar/FilterDropdowns";
import { SortControls } from "@/components/toolbar/SortControls";
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
    <div className="">
      <div className="max-w-7xl mx-auto px-8">
        {/* Search and filters row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search bar gets its own expanding container */}
          <div className="flex-1 min-w-0">
            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          </div>
          
          {/* Filters in a separate container that doesn't shrink */}
          <div className="flex-shrink-0">
            <div className="flex gap-3 items-center">
              <FilterDropdowns 
                statusFilter={statusFilter} 
                onStatusFilterChange={onStatusFilterChange} 
                workTypeFilter={workTypeFilter} 
                onWorkTypeFilterChange={onWorkTypeFilterChange} 
              />
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <SortControls sortBy={sortBy} onSortChange={onSortChange} onRefresh={onRefresh} />
          </div>
        </div>

        {/* Stats row only */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <ToolbarStats 
            totalJobs={totalJobs} 
            selectedCount={selectedJobs.length} 
            activeFiltersCount={activeFiltersCount} 
            needsAttentionFilter={needsAttentionFilter} 
          />
        </div>
      </div>
    </div>
  );
};
