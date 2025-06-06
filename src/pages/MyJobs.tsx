
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
import { JobsHeader } from "@/components/jobs/JobsHeader";
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
    statusFilter,
    setStatusFilter,
    workTypeFilter,
    setWorkTypeFilter,
    sortBy,
    setSortBy,
    filteredJobs,
    clearFilters
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
        onCreateRole={() => setIsCreateModalOpen(true)}
        showCreateButton={true}
      />

      <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <JobsHeader 
            userDisplayName={getUserDisplayName()}
            onCreateJob={() => setIsCreateModalOpen(true)}
          />
          <JobsStats stats={stats} />
        </div>
      </div>

      <JobManagementToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        workTypeFilter={workTypeFilter}
        onWorkTypeFilterChange={setWorkTypeFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalJobs={jobs.length}
        selectedJobs={selectedJobs}
        onBulkAction={handleBulkAction}
        onRefresh={handleRefresh}
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {filteredJobs.length === 0 && jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No jobs yet</p>
              <p className="mb-4">Create your first job posting to start receiving applications</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#007af6] hover:bg-[#0056b3]"
              >
                Create Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No jobs match your filters</p>
              <p className="mb-4">Try adjusting your search or filter criteria</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Showing {filteredJobs.length} of {jobs.length} total jobs
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredJobs.length} of {jobs.length} total jobs
            </div>

            {filteredJobs.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <Checkbox
                  checked={selectedJobs.length === filteredJobs.length}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean, filteredJobs)}
                />
                <span className="text-sm text-gray-600">
                  Select all {filteredJobs.length} job(s)
                </span>
              </div>
            )}

            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="flex gap-4">
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
