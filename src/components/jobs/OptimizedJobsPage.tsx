import { memo } from "react";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useJobSelection } from "@/hooks/useJobSelection";
import { useJobsData } from "@/hooks/useJobsData";
import { useOptimizedJobs } from "@/hooks/useOptimizedJobs";
import { useJobsPageActions } from "@/hooks/jobs/useJobsPageActions";
import { useJobsPageFilters } from "@/hooks/jobs/useJobsPageFilters";
import { useJobsPageState } from "@/hooks/jobs/useJobsPageState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JobsPageBackground } from "./JobsPageBackground";
import { JobsPageLoading } from "./JobsPageLoading";
import { JobsPageContent } from "./JobsPageContent";

export const OptimizedJobsPage = memo(() => {
  const { user, profile } = useOptimizedAuth();

  // Use optimized jobs hook for better performance
  const { data: jobs = [], isLoading: jobsLoading, refetch } = useOptimizedJobs(user?.id);

  // Consolidated data hook (keeping existing logic but with optimized data)
  const {
    filteredJobs,
    stats,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    clearAllFilters,
    needsAttentionFilter,
    setNeedsAttentionFilter,
    activeJobsFilter,
    setActiveJobsFilter,
    activeFiltersCount
  } = useJobsData();

  // Job selection (keeping existing logic)
  const {
    selectedJobs,
    handleJobSelection,
    handleSelectAll,
    handleBulkAction
  } = useJobSelection(jobs, refetch);

  // Extract state management
  const {
    isCreatePanelOpen,
    setIsCreatePanelOpen,
    getUserDisplayName,
    handleCreateJob
  } = useJobsPageState(profile, user);

  // Extract actions
  const { handleRefresh } = useJobsPageActions(refetch);

  // Extract filter actions
  const { handleNeedsAttentionClick, handleActiveJobsClick } = useJobsPageFilters({
    needsAttentionFilter,
    setNeedsAttentionFilter,
    activeJobsFilter,
    setActiveJobsFilter,
    setSortBy
  });

  // Use jobsLoading from optimized hook instead of consolidated loading
  if (jobsLoading) {
    return <JobsPageLoading />;
  }

  return (
    <ErrorBoundary>
      <JobsPageBackground>
        <JobsPageContent
          onCreateJob={handleCreateJob}
          jobs={jobs}
          filteredJobs={filteredJobs}
          stats={stats}
          userDisplayName={getUserDisplayName()}
          needsAttentionFilter={needsAttentionFilter}
          activeJobsFilter={activeJobsFilter}
          onNeedsAttentionClick={handleNeedsAttentionClick}
          onActiveJobsClick={handleActiveJobsClick}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activeFiltersCount={activeFiltersCount}
          selectedJobs={selectedJobs}
          onJobSelection={handleJobSelection}
          onSelectAll={handleSelectAll}
          onBulkAction={handleBulkAction}
          onRefresh={handleRefresh}
          refetch={refetch}
          clearAllFilters={clearAllFilters}
          isCreatePanelOpen={isCreatePanelOpen}
          setIsCreatePanelOpen={setIsCreatePanelOpen}
        />
      </JobsPageBackground>
    </ErrorBoundary>
  );
});

OptimizedJobsPage.displayName = 'OptimizedJobsPage';
