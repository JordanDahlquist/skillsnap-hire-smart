
import { memo, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { OptimizedJobCard } from "@/components/OptimizedJobCard";
import { VirtualList } from "@/components/ui/virtual-list";
import { getTimeAgo } from "@/utils/dateUtils";
import { Job } from "@/types";
import { UI_CONSTANTS } from "@/constants/ui";

interface OptimizedJobsContentProps {
  jobs: Job[];
  filteredJobs: Job[];
  selectedJobs: string[];
  onJobSelection: (jobId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean, jobs: Job[]) => void;
  onCreateJob: () => void;
  onRefetch: () => void;
  clearFilters: () => void;
  needsAttentionFilter: boolean;
  activeJobsFilter: boolean;
}

const JobItem = memo(({ 
  job, 
  selectedJobs, 
  onJobSelection, 
  onRefetch 
}: { 
  job: Job; 
  selectedJobs: string[]; 
  onJobSelection: (jobId: string, checked: boolean) => void; 
  onRefetch: () => void; 
}) => {
  const handleJobSelection = useCallback((checked: boolean) => {
    onJobSelection(job.id, checked);
  }, [job.id, onJobSelection]);

  const isSelected = useMemo(() => 
    selectedJobs.includes(job.id), 
    [selectedJobs, job.id]
  );

  return (
    <div className="flex gap-6 mb-6">
      <div className="flex items-start pt-6">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleJobSelection}
        />
      </div>
      <div className="flex-1">
        <OptimizedJobCard
          job={job}
          onJobUpdate={onRefetch}
          getTimeAgo={getTimeAgo}
        />
      </div>
    </div>
  );
});

JobItem.displayName = 'JobItem';

export const OptimizedJobsContent = memo(({
  jobs,
  filteredJobs,
  selectedJobs,
  onJobSelection,
  onSelectAll,
  onCreateJob,
  onRefetch,
  clearFilters,
  needsAttentionFilter,
  activeJobsFilter
}: OptimizedJobsContentProps) => {
  const handleSelectAll = useCallback((checked: boolean) => {
    onSelectAll(checked, filteredJobs);
  }, [onSelectAll, filteredJobs]);

  const renderJobItem = useCallback((job: Job, index: number) => (
    <JobItem
      key={job.id}
      job={job}
      selectedJobs={selectedJobs}
      onJobSelection={onJobSelection}
      onRefetch={onRefetch}
    />
  ), [selectedJobs, onJobSelection, onRefetch]);

  const useVirtualScrolling = useMemo(() => 
    filteredJobs.length > 25, 
    [filteredJobs.length]
  );

  const allSelected = useMemo(() => 
    selectedJobs.length === filteredJobs.length && filteredJobs.length > 0,
    [selectedJobs.length, filteredJobs.length]
  );

  if (filteredJobs.length === 0 && jobs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">No jobs yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first job posting to start receiving applications and building your talent pipeline
            </p>
            <Button 
              onClick={onCreateJob}
              className="bg-[#007af6] hover:bg-[#0056b3] px-8 py-3 text-lg font-semibold"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Card>
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-4">
      <div className="space-y-3">
        {filteredJobs.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium text-foreground">
                    Select all {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-sm text-foreground">
                  Showing <span className="font-semibold">{filteredJobs.length}</span> of <span className="font-semibold">{jobs.length}</span> total jobs
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
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {useVirtualScrolling ? (
            <VirtualList
              items={filteredJobs}
              itemHeight={300}
              containerHeight={600}
              renderItem={renderJobItem}
              overscan={5}
            />
          ) : (
            filteredJobs.map((job) => (
              <JobItem
                key={job.id}
                job={job}
selectedJobs={selectedJobs}
                onJobSelection={onJobSelection}
                onRefetch={onRefetch}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

OptimizedJobsContent.displayName = 'OptimizedJobsContent';
