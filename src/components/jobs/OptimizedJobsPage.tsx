
import { useState, memo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useJobSelection } from "@/hooks/useJobSelection";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { useJobsData } from "@/hooks/useJobsData";
import { useStandardizedError } from "@/hooks/useStandardizedError";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JobsHeaderSection } from "./JobsHeaderSection";
import { JobsToolbar } from "./JobsToolbar";
import { OptimizedJobsContent } from "./OptimizedJobsContent";
import { LOADING_MESSAGES, SUCCESS_MESSAGES } from "@/constants/messages";

export const OptimizedJobsPage = memo(() => {
  const { user, profile } = useAuth();
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const { toast } = useToast();
  const { execute: executeAsync } = useAsyncOperation();
  const { handleError } = useStandardizedError();

  // Consolidated data hook
  const {
    jobs,
    filteredJobs,
    isLoading,
    refetch,
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

  // Job selection
  const {
    selectedJobs,
    handleJobSelection,
    handleSelectAll,
    handleBulkAction
  } = useJobSelection(jobs, refetch);

  const getUserDisplayName = useCallback(() => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'there';
  }, [profile?.full_name, user?.email]);

  const handleRefresh = useCallback(async () => {
    try {
      await executeAsync(
        async () => {
          await refetch();
          return true;
        },
        {
          logOperation: 'Manual refresh triggered',
          onSuccess: () => {
            toast({
              title: "Refreshed",
              description: SUCCESS_MESSAGES.UPDATED,
            });
          }
        }
      );
    } catch (error) {
      handleError(error, {
        component: 'OptimizedJobsPage',
        action: 'Manual refresh',
        toastTitle: 'Refresh failed',
        fallbackMessage: 'Unable to refresh jobs. Please try again.'
      });
    }
  }, [executeAsync, refetch, toast, handleError]);

  const handleNeedsAttentionClick = useCallback(() => {
    const newValue = !needsAttentionFilter;
    setNeedsAttentionFilter(newValue);
    setActiveJobsFilter(false);
    
    if (newValue) {
      setSortBy("needs_attention");
      toast({
        title: "Filtered by Attention",
        description: "Showing jobs with 10+ pending applications",
      });
    } else {
      toast({
        title: "Filter Cleared",
        description: "Showing all jobs",
      });
    }
  }, [needsAttentionFilter, setNeedsAttentionFilter, setActiveJobsFilter, setSortBy, toast]);

  const handleActiveJobsClick = useCallback(() => {
    const newValue = !activeJobsFilter;
    setActiveJobsFilter(newValue);
    setNeedsAttentionFilter(false);
    
    if (newValue) {
      setSortBy("updated_at");
      toast({
        title: "Filtered by Active Jobs",
        description: "Showing only active job postings",
      });
    } else {
      toast({
        title: "Filter Cleared",
        description: "Showing all jobs",
      });
    }
  }, [activeJobsFilter, setActiveJobsFilter, setNeedsAttentionFilter, setSortBy, toast]);

  const handleCreateJob = useCallback(() => {
    setIsCreatePanelOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{LOADING_MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", isCurrentPage: true }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <UnifiedHeader 
          breadcrumbs={breadcrumbs}
          onCreateRole={handleCreateJob}
          showCreateButton={true}
        />

        <JobsHeaderSection
          userDisplayName={getUserDisplayName()}
          onCreateJob={handleCreateJob}
          stats={stats}
          onNeedsAttentionClick={handleNeedsAttentionClick}
          needsAttentionActive={needsAttentionFilter}
          onActiveJobsClick={handleActiveJobsClick}
          activeJobsFilterActive={activeJobsFilter}
        />

        <JobsToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={filters.employmentType}
          onStatusFilterChange={(value) => setFilters({ ...filters, employmentType: value })}
          workTypeFilter={filters.locationType}
          onWorkTypeFilterChange={(value) => setFilters({ ...filters, locationType: value })}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalJobs={jobs.length}
          selectedJobs={selectedJobs}
          onBulkAction={handleBulkAction}
          onRefresh={handleRefresh}
          needsAttentionFilter={needsAttentionFilter}
          activeFiltersCount={activeFiltersCount}
        />

        <OptimizedJobsContent
          jobs={jobs}
          filteredJobs={filteredJobs}
          selectedJobs={selectedJobs}
          onJobSelection={handleJobSelection}
          onSelectAll={handleSelectAll}
          onCreateJob={handleCreateJob}
          onRefetch={refetch}
          clearFilters={clearAllFilters}
          needsAttentionFilter={needsAttentionFilter}
          activeJobsFilter={activeJobsFilter}
        />

        <JobCreatorPanel 
          open={isCreatePanelOpen} 
          onOpenChange={setIsCreatePanelOpen} 
        />
      </div>
    </ErrorBoundary>
  );
});

OptimizedJobsPage.displayName = 'OptimizedJobsPage';
