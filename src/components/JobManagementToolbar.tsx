
import { SearchBar } from "@/components/toolbar/SearchBar";
import { FilterDropdowns } from "@/components/toolbar/FilterDropdowns";
import { SortControls } from "@/components/toolbar/SortControls";
import { ToolbarStats } from "@/components/toolbar/ToolbarStats";

interface JobManagementToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (status: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  totalJobs: number;
  selectedJobs: string[];
  onBulkAction: (action: string) => void;
  onRefresh: () => void;
  locationFilter?: string;
  onLocationFilterChange?: (location: string) => void;
  workTypeFilter?: string[];
  onWorkTypeFilterChange?: (workType: string[]) => void;
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
  sortOrder,
  onSortOrderChange,
  totalJobs,
  selectedJobs,
  onBulkAction,
  onRefresh,
  workTypeFilter = ['all'],
  onWorkTypeFilterChange = () => {},
  needsAttentionFilter = false,
  activeFiltersCount = 0
}: JobManagementToolbarProps) => {
  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-8">
        {/* Search and filters row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search bar with reduced width */}
          <div className="w-full sm:w-80 flex-shrink-0">
            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          </div>
          
          {/* Filters with more space */}
          <div className="flex-1 flex justify-center">
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
            <SortControls 
              sortBy={sortBy} 
              onSortChange={onSortChange}
              sortOrder={sortOrder}
              onSortOrderChange={onSortOrderChange}
              onRefresh={onRefresh} 
            />
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
