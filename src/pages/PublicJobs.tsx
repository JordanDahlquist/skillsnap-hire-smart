import { useState } from "react";
import { usePublicJobs } from "@/hooks/usePublicJobs";
import { useJobsData } from "@/hooks/useJobsData";
import { PublicJobsHeader } from "@/components/public-jobs/PublicJobsHeader";
import { PublicJobsFilters } from "@/components/public-jobs/PublicJobsFilters";
import { PublicJobsList } from "@/components/public-jobs/PublicJobsList";

const PublicJobs = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    roleType: "all",
    locationType: "all",
  });

  const { jobs, isLoading, error } = usePublicJobs(selectedFilters);

  const handleFilterChange = (newFilters: any) => {
    setSelectedFilters(newFilters);
  };

  if (isLoading) {
    return <div>Loading public jobs...</div>;
  }

  if (error) {
    return <div>Error loading public jobs.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PublicJobsHeader />
      <div className="flex flex-col md:flex-row gap-4">
        <PublicJobsFilters onFilterChange={handleFilterChange} />
        <PublicJobsList jobs={jobs} />
      </div>
    </div>
  );
};

export default PublicJobs;
