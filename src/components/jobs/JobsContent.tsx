
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { RefactoredJobCard } from "@/components/RefactoredJobCard";
import { getTimeAgo } from "@/utils/dateUtils";
import { Job } from "@/types";

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

export const JobsContent = ({
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
  if (filteredJobs.length === 0 && jobs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
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
                  onCheckedChange={(checked) => onSelectAll(checked as boolean, filteredJobs)}
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
                  onCheckedChange={(checked) => onJobSelection(job.id, checked as boolean)}
                />
              </div>
              <div className="flex-1">
                <RefactoredJobCard
                  job={job}
                  onJobUpdate={onRefetch}
                  getTimeAgo={getTimeAgo}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
