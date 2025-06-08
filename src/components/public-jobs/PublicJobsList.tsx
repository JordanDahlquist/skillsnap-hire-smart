
import { PublicJobCard } from "@/components/PublicJobCard";
import { Briefcase } from "lucide-react";
import { memo } from "react";

interface PublicJobsListProps {
  jobs: any[];
  loading: boolean;
  searchTerm: string;
  activeFiltersCount: number;
  getTimeAgo: (dateString: string) => string;
}

export const PublicJobsList = memo(({
  jobs,
  loading,
  searchTerm,
  activeFiltersCount,
  getTimeAgo
}: PublicJobsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (jobs.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {jobs.map(job => (
          <PublicJobCard 
            key={job.id} 
            job={job} 
            getTimeAgo={getTimeAgo} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-900 mb-1">No matching positions found</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {searchTerm || activeFiltersCount > 0 ? 
          "Try using fewer specific terms or clearing some filters to see more opportunities" : 
          "Check back soon for new opportunities"}
      </p>
    </div>
  );
});

PublicJobsList.displayName = 'PublicJobsList';
