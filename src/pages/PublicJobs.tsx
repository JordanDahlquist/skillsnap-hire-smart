import { useState, useMemo } from "react";
import { usePublicJobs } from "@/hooks/usePublicJobs";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { PublicJobsHeader } from "@/components/public-jobs/PublicJobsHeader";
import { PublicJobsFilters } from "@/components/public-jobs/PublicJobsFilters";
import { PublicJobsList } from "@/components/public-jobs/PublicJobsList";
import { Footer } from "@/components/Footer";

const PublicJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    roleType: "all",
    locationType: "all",
    experienceLevel: "all",
    employmentType: "all",
    country: "all",
    state: "all",
    budgetRange: [0, 200000] as [number, number],
    duration: "all",
  });
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { jobs, loading, getTimeAgo, refetchJobs } = usePublicJobs();

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      // Search filter
      if (searchTerm && !job.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !job.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Employment type filter
      if (filters.employmentType !== "all" && job.employment_type !== filters.employmentType) {
        return false;
      }

      // Location type filter
      if (filters.locationType !== "all" && job.location_type !== filters.locationType) {
        return false;
      }

      // Experience level filter
      if (filters.experienceLevel !== "all" && job.experience_level !== filters.experienceLevel) {
        return false;
      }

      return true;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "title":
          aValue = a.title?.toLowerCase() || "";
          bValue = b.title?.toLowerCase() || "";
          break;
        case "updated_at":
        default:
          aValue = new Date(a.updated_at || 0).getTime();
          bValue = new Date(b.updated_at || 0).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [jobs, searchTerm, filters, sortBy, sortOrder]);

  // Calculate active filters count
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "budgetRange") {
      const range = value as [number, number];
      return range[0] > 0 || range[1] < 200000;
    }
    return value !== "all";
  }).length;

  // Available filter options based on current jobs
  const availableOptions = useMemo(() => {
    const locationTypes = [...new Set(jobs.map(job => job.location_type).filter(Boolean))];
    const experienceLevels = [...new Set(jobs.map(job => job.experience_level).filter(Boolean))];
    const employmentTypes = [...new Set(jobs.map(job => job.employment_type).filter(Boolean))];
    const countries = [...new Set(jobs.map(job => job.country).filter(Boolean))];
    const states = [...new Set(jobs.map(job => job.state).filter(Boolean))];
    const durations = [...new Set(jobs.map(job => job.duration).filter(Boolean))];

    return {
      locationTypes,
      experienceLevels,
      employmentTypes,
      countries,
      states,
      durations,
    };
  }, [jobs]);

  const handleAiSearch = async (prompt: string) => {
    // Placeholder for AI search functionality
    console.log("AI search:", prompt);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      roleType: "all",
      locationType: "all",
      experienceLevel: "all",
      employmentType: "all",
      country: "all",
      state: "all",
      budgetRange: [0, 200000],
      duration: "all",
    });
    setSortBy("updated_at");
    setSortOrder("desc");
  };

  const breadcrumbs = [
    { label: "Public Jobs", isCurrentPage: true }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UnifiedHeader 
        breadcrumbs={breadcrumbs}
        showCreateButton={false}
      />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <PublicJobsHeader />
        
        <PublicJobsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onAiSearch={handleAiSearch}
          onClearFilters={handleClearFilters}
          availableOptions={availableOptions}
          activeFiltersCount={activeFiltersCount}
          resultCount={filteredJobs.length}
        />
        
        <PublicJobsList 
          jobs={filteredJobs} 
          loading={loading}
          searchTerm={searchTerm}
          activeFiltersCount={activeFiltersCount}
          getTimeAgo={getTimeAgo}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default PublicJobs;
