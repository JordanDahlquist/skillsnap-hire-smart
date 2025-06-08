
import { useState } from "react";
import { usePublicJobs } from "@/hooks/usePublicJobs";
import { PublicJobsHeader } from "@/components/public-jobs/PublicJobsHeader";
import { PublicJobsList } from "@/components/public-jobs/PublicJobsList";

const PublicJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    roleType: "all",
    locationType: "all",
  });

  const { jobs, loading, getTimeAgo } = usePublicJobs();

  // Calculate active filters count
  const activeFiltersCount = Object.values(filters).filter(value => value !== "all").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <PublicJobsHeader />
      <div className="flex flex-col md:flex-row gap-4">
        <PublicJobsList 
          jobs={jobs} 
          loading={loading}
          searchTerm={searchTerm}
          activeFiltersCount={activeFiltersCount}
          getTimeAgo={getTimeAgo}
        />
      </div>
    </div>
  );
};

export default PublicJobs;
