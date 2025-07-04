
import { memo } from "react";
import { Job } from "@/types";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { JobsHeaderSection } from "./JobsHeaderSection";
import { JobsToolbar } from "./JobsToolbar";
import { OptimizedJobsContent } from "./OptimizedJobsContent";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";

interface JobsPageContentProps {
  // Header props
  onCreateJob: () => void;
  
  // Jobs data
  jobs: Job[];
  filteredJobs: Job[];
  
  // User data
  userDisplayName: string;
  
  // Search and filters
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder?: "asc" | "desc";
  setSortOrder?: (order: "asc" | "desc") => void;
  activeFiltersCount: number;
  
  // Job selection
  selectedJobs: string[];
  onJobSelection: (jobId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean, filteredJobs: Job[]) => void;
  onBulkAction: (action: string) => void;
  
  // Actions
  onRefresh: () => void;
  refetch: () => void;
  clearAllFilters: () => void;
  
  // Panel state
  isCreatePanelOpen: boolean;
  setIsCreatePanelOpen: (open: boolean) => void;
}

export const JobsPageContent = memo(({
  onCreateJob,
  jobs,
  filteredJobs,
  userDisplayName,
  searchTerm,
  onSearchChange,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  activeFiltersCount,
  selectedJobs,
  onJobSelection,
  onSelectAll,
  onBulkAction,
  onRefresh,
  refetch,
  clearAllFilters,
  isCreatePanelOpen,
  setIsCreatePanelOpen
}: JobsPageContentProps) => {
  const breadcrumbs = [
    { label: "Dashboard", isCurrentPage: true }
  ];

  return (
    <>
      <UnifiedHeader 
        breadcrumbs={breadcrumbs}
        onCreateRole={onCreateJob}
        showCreateButton={true}
      />

      <JobsHeaderSection
        userDisplayName={userDisplayName}
        onCreateJob={onCreateJob}
      />

      <JobsToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={filters.status}
        onStatusFilterChange={(value) => setFilters({ ...filters, status: value })}
        workTypeFilter={filters.locationType || ['all']}
        onWorkTypeFilterChange={(value) => setFilters({ ...filters, locationType: value })}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        totalJobs={jobs.length}
        selectedJobs={selectedJobs}
        onBulkAction={onBulkAction}
        onRefresh={onRefresh}
        needsAttentionFilter={false}
        activeFiltersCount={activeFiltersCount}
      />

      <OptimizedJobsContent
        jobs={jobs}
        filteredJobs={filteredJobs}
        selectedJobs={selectedJobs}
        onJobSelection={onJobSelection}
        onSelectAll={onSelectAll}
        onCreateJob={onCreateJob}
        onRefetch={refetch}
        clearFilters={clearAllFilters}
        needsAttentionFilter={false}
        activeJobsFilter={false}
        onBulkAction={onBulkAction}
      />

      <JobCreatorPanel 
        open={isCreatePanelOpen} 
        onOpenChange={setIsCreatePanelOpen}
        onJobCreated={refetch}
      />
    </>
  );
});

JobsPageContent.displayName = 'JobsPageContent';
