import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useJobs } from "@/hooks/useJobs";
import { useRecentApplications } from "@/hooks/useApplications";
import { useJobStats } from "@/hooks/useJobStats";
import { useJobSelection } from "@/hooks/useJobSelection";
import { useJobFiltering } from "@/hooks/useJobFiltering";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { JobCreatorPanel } from "@/components/JobCreatorPanel";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JobsHeaderSection } from "./JobsHeaderSection";
import { JobsToolbar } from "./JobsToolbar";
import { JobsContent } from "./JobsContent";
import { logger } from "@/services/loggerService";
import { LOADING_MESSAGES, SUCCESS_MESSAGES } from "@/constants/messages";

export const JobsPage = () => {
  const { user, profile } = useAuth();
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const { toast } = useToast();
  const { execute: executeAsync } = useAsyncOperation();

  // Data fetching
  const { data: jobs = [], isLoading, refetch } = useJobs();
  const { data: recentApplications = [] } = useRecentApplications(jobs.map(job => job.id));

  // Stats calculation
  const stats = useJobStats(jobs, recentApplications);

  // Job filtering and sorting
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredJobs,
    clearFilters,
    needsAttentionFilter,
    setNeedsAttentionFilter,
    activeJobsFilter,
    setActiveJobsFilter,
    activeFiltersCount
  } = useJobFiltering(jobs);

  // Job selection
  const {
    selectedJobs,
    handleJobSelection,
    handleSelectAll,
    handleBulkAction
  } = useJobSelection(jobs, refetch);

  const getUserDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'there';
  };

  const handleRefresh = async () => {
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
  };

  const handleNeedsAttentionClick = () => {
    const newValue = !needsAttentionFilter;
    setNeedsAttentionFilter(newValue);
    setActiveJobsFilter(false);
    
    if (newValue) {
      setSortBy("needs_attention");
      toast({
        title: "Filtered by Attention",
        description: "Showing jobs with 10+ pending applications",
      });
      logger.info('Needs attention filter activated');
    } else {
      toast({
        title: "Filter Cleared",
        description: "Showing all jobs",
      });
      logger.info('Needs attention filter cleared');
    }
  };

  const handleActiveJobsClick = () => {
    const newValue = !activeJobsFilter;
    setActiveJobsFilter(newValue);
    setNeedsAttentionFilter(false);
    
    if (newValue) {
      setSortBy("updated_at");
      toast({
        title: "Filtered by Active Jobs",
        description: "Showing only active job postings",
      });
      logger.info('Active jobs filter activated');
    } else {
      toast({
        title: "Filter Cleared",
        description: "Showing all jobs",
      });
      logger.info('Active jobs filter cleared');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007af6] mx-auto"></div>
          <p className="mt-4 text-gray-600">{LOADING_MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", isCurrentPage: true }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader 
          breadcrumbs={breadcrumbs}
          onCreateRole={() => setIsCreatePanelOpen(true)}
          showCreateButton={true}
        />

        <ErrorBoundary>
          <JobsHeaderSection
            userDisplayName={getUserDisplayName()}
            onCreateJob={() => setIsCreatePanelOpen(true)}
            stats={stats}
            onNeedsAttentionClick={handleNeedsAttentionClick}
            needsAttentionActive={needsAttentionFilter}
            onActiveJobsClick={handleActiveJobsClick}
            activeJobsFilterActive={activeJobsFilter}
          />
        </ErrorBoundary>

        <ErrorBoundary>
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
        </ErrorBoundary>

        <ErrorBoundary>
          <JobsContent
            jobs={jobs}
            filteredJobs={filteredJobs}
            selectedJobs={selectedJobs}
            onJobSelection={handleJobSelection}
            onSelectAll={handleSelectAll}
            onCreateJob={() => setIsCreatePanelOpen(true)}
            onRefetch={refetch}
            clearFilters={clearFilters}
            needsAttentionFilter={needsAttentionFilter}
            activeJobsFilter={activeJobsFilter}
          />
        </ErrorBoundary>

        <JobCreatorPanel 
          open={isCreatePanelOpen} 
          onOpenChange={setIsCreatePanelOpen} 
        />
      </div>
    </ErrorBoundary>
  );
};
