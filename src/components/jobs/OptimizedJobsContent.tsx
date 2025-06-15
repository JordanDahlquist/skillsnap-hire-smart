
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
import { BulkActionsDropdown } from "@/components/toolbar/BulkActionsDropdown";
import { useThemeContext } from "@/contexts/ThemeContext";

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
  onBulkAction: (action: string) => void;
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
    <div className="mb-6">
      <OptimizedJobCard
        job={job}
        onJobUpdate={onRefetch}
        getTimeAgo={getTimeAgo}
        isSelected={isSelected}
        onJobSelection={handleJobSelection}
      />
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
  activeJobsFilter,
  onBulkAction
}: OptimizedJobsContentProps) => {
  const { currentTheme } = useThemeContext();
  
  // Theme-aware text colors
  const titleColor = currentTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const textColor = currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-600';
  const labelTextColor = currentTheme === 'dark' ? 'text-white' : 'text-foreground';

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
        <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:bg-card/90 hover:border-border/60">
          <CardContent className={`p-12 text-center ${textColor}`}>
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${titleColor}`}>No jobs yet</h3>
            <p className={`mb-6 max-w-md mx-auto ${textColor}`}>
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
        <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:bg-card/90 hover:border-border/60">
          <CardContent className={`p-12 text-center ${textColor}`}>
            <h3 className={`text-xl font-semibold mb-3 ${titleColor}`}>No jobs match your filters</h3>
            <p className={`mb-6 ${textColor}`}>Try adjusting your search or filter criteria</p>
            <div className="space-y-4">
              <p className={`text-sm ${textColor}`}>
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
          <Card className="backdrop-blur-sm bg-card/80 border-2 border-border/50 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] hover:bg-card/90 hover:border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className={`text-sm font-medium ${labelTextColor}`}>
                    Select all {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                  </span>
                  <BulkActionsDropdown 
                    selectedCount={selectedJobs.length}
                    onBulkAction={onBulkAction}
                  />
                </div>
                <div className={`text-sm ${labelTextColor}`}>
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

export default OptimizedJobsContent;
