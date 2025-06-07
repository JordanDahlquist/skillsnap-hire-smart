
import { JobFilters } from "@/components/JobFilters";
import { JobSorting } from "@/components/JobSorting";

interface PublicJobsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  onAiSearch: (prompt: string) => Promise<void>;
  onClearFilters: () => void;
  availableOptions: any;
  activeFiltersCount: number;
  resultCount: number;
}

export const PublicJobsFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onAiSearch,
  onClearFilters,
  availableOptions,
  activeFiltersCount,
  resultCount
}: PublicJobsFiltersProps) => {
  return (
    <>
      <JobFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        onAiSearch={onAiSearch}
        onClearFilters={onClearFilters}
        availableOptions={availableOptions}
        activeFiltersCount={activeFiltersCount}
      />
      
      <JobSorting
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        resultCount={resultCount}
      />
    </>
  );
};
