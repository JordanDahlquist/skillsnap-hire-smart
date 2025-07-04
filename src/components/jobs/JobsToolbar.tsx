
import { JobManagementToolbar } from "@/components/JobManagementToolbar";

interface JobsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  workTypeFilter: string[];
  onWorkTypeFilterChange: (workType: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  totalJobs: number;
  selectedJobs: string[];
  onBulkAction: (action: string) => void;
  onRefresh: () => void;
  needsAttentionFilter: boolean;
  activeFiltersCount: number;
}

export const JobsToolbar = (props: JobsToolbarProps) => {
  return <JobManagementToolbar {...props} />;
};
