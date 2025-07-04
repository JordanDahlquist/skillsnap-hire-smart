
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

interface FilterDropdownsProps {
  statusFilter: string[];
  onStatusFilterChange: (status: string[]) => void;
  workTypeFilter: string[];
  onWorkTypeFilterChange: (workType: string[]) => void;
}

export const FilterDropdowns = ({
  statusFilter,
  onStatusFilterChange,
  workTypeFilter,
  onWorkTypeFilterChange
}: FilterDropdownsProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'draft', label: 'Draft' },
    { value: 'closed', label: 'Closed' },
    { value: 'archived', label: 'Archived' }
  ].filter(option => option.value && option.value.trim() !== '');
  
  const workTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'remote', label: 'Remote' },
    { value: 'on-site', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' }
  ].filter(option => option.value && option.value.trim() !== '');

  return (
    <>
      <MultiSelectDropdown
        options={statusOptions}
        selectedValues={statusFilter || ['all']}
        onSelectionChange={onStatusFilterChange}
        placeholder="Status"
        icon={<Filter className="w-4 h-4" />}
        className="w-24"
      />

      <MultiSelectDropdown
        options={workTypeOptions}
        selectedValues={workTypeFilter || ['all']}
        onSelectionChange={onWorkTypeFilterChange}
        placeholder="Types"
        className="w-24"
      />
    </>
  );
};
