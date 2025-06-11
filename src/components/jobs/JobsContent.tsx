
import { memo, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { OptimizedJobCard } from "@/components/OptimizedJobCard";
import { VirtualList } from "@/components/ui/virtual-list";
import { getTimeAgo } from "@/utils/dateUtils";
import { Job } from "@/types";
import { logger } from "@/services/loggerService";
import { UI_CONSTANTS } from "@/constants/ui";
import { useThemeContext } from "@/contexts/ThemeContext";

interface JobsContentProps {
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
    logger.debug('Job selection changed', { jobId: job.id, selected: checked });
  }, [job.id, onJobSelection]);

  return (
    <div className="flex gap-6 mb-6">
      <div className="flex items-start pt-6">
        <Checkbox
          checked={selectedJobs.includes(job.id)}
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

export const JobsContent = memo(({
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
}: JobsContentProps) => {
  const { currentTheme } = useThemeContext();
  
  // Theme-aware text colors
  const titleColor = currentTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const textColor = currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-600';
  const subtleTextColor = currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const labelTextColor = currentTheme === 'dark' ? 'text-white' : 'text-gray-700';

  const handleSelectAll = useCallback((checked: boolean) => {
    onSelectAll(checked, filteredJobs);
    logger.info(`${checked ? 'Selected' : 'Deselected'} all jobs`, { count: filteredJobs.length });
  }, [onSelectAll, filteredJobs]);

  const handleCreateJob = useCallback(() => {
    logger.info('Create job action triggered');
    onCreateJob();
  }, [onCreateJob]);

  const handleClearFilters = useCallback(() => {
    logger.info('Clear filters action triggered');
    clearFilters();
  }, [clearFilters]);

  const renderJobItem = useCallback((job: Job, index: number) => (
    <JobItem
      key={job.id}
      job={job}
      selectedJobs={selectedJobs}
      onJobSelection={onJobSelection}
      onRefetch={onRefetch}
    />
  ), [selectedJobs, onJobSelection, onRefetch]);

  if (filteredJobs.length === 0 && jobs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Card>
          <CardContent className={`p-12 text-center ${subtleTextColor}`}>
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${titleColor}`}>No jobs yet</h3>
            <p className={`mb-6 max-w-md mx-auto ${textColor}`}>
              Create your first job posting to start receiving applications and building your talent pipeline
            </p>
            <Button 
              onClick={handleCreateJob}
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
          <CardContent className={`p-12 text-center ${subtleTextColor}`}>
            <h3 className={`text-xl font-semibold mb-3 ${titleColor}`}>No jobs match your filters</h3>
            <p className={`mb-6 ${textColor}`}>Try adjusting your search or filter criteria</p>
            <div className="space-y-4">
              <p className={`text-sm ${textColor}`}>
                Showing {filteredJobs.length} of {jobs.length} total jobs
              </p>
              <Button variant="outline" onClick={handleClearFilters} size="lg">
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const useVirtualScrolling = filteredJobs.length > UI_CONSTANTS.VIRTUAL_LIST.THRESHOLD_FOR_VIRTUALIZATION;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className={`text-sm ${textColor}`}>
            Showing <span className={`font-semibold ${titleColor}`}>{filteredJobs.length}</span> of <span className={`font-semibold ${titleColor}`}>{jobs.length}</span> total jobs
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedJobs.length === filteredJobs.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className={`text-sm font-medium ${labelTextColor}`}>
                  Select all {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {useVirtualScrolling ? (
            <VirtualList
              items={filteredJobs}
              itemHeight={UI_CONSTANTS.VIRTUAL_LIST.ITEM_HEIGHT}
              containerHeight={UI_CONSTANTS.VIRTUAL_LIST.CONTAINER_HEIGHT}
              renderItem={renderJobItem}
              overscan={UI_CONSTANTS.VIRTUAL_LIST.OVERSCAN}
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

JobsContent.displayName = 'JobsContent';
