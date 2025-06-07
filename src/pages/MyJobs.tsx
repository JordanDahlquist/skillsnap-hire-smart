
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CreateRoleModal } from "@/components/CreateRoleModal";
import { EnhancedJobCard } from "@/components/EnhancedJobCard";
import { JobManagementToolbar } from "@/components/JobManagementToolbar";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { useToast } from "@/components/ui/use-toast";
import { useJobs } from "@/hooks/useJobs";
import { useRecentApplications } from "@/hooks/useApplications";
import { useJobStats } from "@/hooks/useJobStats";
import { useJobSelection } from "@/hooks/useJobSelection";
import { useJobFiltering } from "@/hooks/useJobFiltering";
import { getTimeAgo } from "@/utils/dateUtils";
import { AIDailyBriefing } from "@/components/jobs/AIDailyBriefing";
import { JobsStats } from "@/components/jobs/JobsStats";

const MyJobs = () => {
  const { user, profile } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

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

  // Get user's display name (first name only)
  const getUserDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'there';
  };

  // Enhanced refetch function with cache invalidation
  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    await refetch();
    toast({
      title: "Refreshed",
      description: "Job data has been updated",
    });
  };

  // Handle needs attention filter toggle
  const handleNeedsAttentionClick = () => {
    setNeedsAttentionFilter(!needsAttentionFilter);
    setActiveJobsFilter(false); // Clear other filter
    if (!needsAttentionFilter) {
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
  };

  // Handle active jobs filter toggle
  const handleActiveJobsClick = () => {
    setActiveJobsFilter(!activeJobsFilter);
    setNeedsAttentionFilter(false); // Clear other filter
    if (!activeJobsFilter) {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007af6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", isCurrentPage: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        breadcrumbs={breadcrumbs}
        onCreateClick={() => setIsCreateModalOpen(true)}
        showCreateButton={true}
      />

      {/* Enhanced Header Section with AI Briefing */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-b border-gray-100 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20 -translate-x-32 -translate-y-32"></div>
          <div className="absolute top-20 right-0 w-48 h-48 bg-indigo-200 rounded-full blur-2xl opacity-30 translate-x-24 -translate-y-12"></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-32 bg-purple-100 rounded-full blur-2xl opacity-25 -translate-x-40 translate-y-16"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <AIDailyBriefing 
            userDisplayName={getUserDisplayName()}
            onCreateJob={() => setIsCreateModalOpen(true)}
          />
          <JobsStats 
            stats={stats} 
            onNeedsAttentionClick={handleNeedsAttentionClick}
            needsAttentionActive={needsAttentionFilter}
            onActiveJobsClick={handleActiveJobsClick}
            activeJobsFilterActive={activeJobsFilter}
          />
        </div>
      </div>

      <JobManagementToolbar
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

      <div className="max-w-7xl mx-auto px-8 py-8">
        {filteredJobs.length === 0 && jobs.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center text-gray-500">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">No jobs yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first job posting to start receiving applications and building your talent pipeline
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#007af6] hover:bg-[#0056b3] px-8 py-3 text-lg font-semibold"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center text-gray-500">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">No jobs match your filters</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredJobs.length} of {jobs.length} total jobs
                </p>
                <Button variant="outline" onClick={clearFilters} size="lg">
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredJobs.length}</span> of <span className="font-semibold text-gray-900">{jobs.length}</span> total jobs
                {needsAttentionFilter && (
                  <span className="ml-2 text-orange-600 font-medium">
                    (filtered for jobs needing attention)
                  </span>
                )}
                {activeJobsFilter && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (filtered for active jobs)
                  </span>
                )}
              </div>
            </div>

            {filteredJobs.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedJobs.length === filteredJobs.length}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean, filteredJobs)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select all {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="flex gap-6">
                  <div className="flex items-start pt-6">
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={(checked) => handleJobSelection(job.id, checked as boolean)}
                    />
                  </div>
                  <div className="flex-1">
                    <EnhancedJobCard
                      job={job}
                      onJobUpdate={refetch}
                      getTimeAgo={getTimeAgo}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateRoleModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
};

export default MyJobs;
