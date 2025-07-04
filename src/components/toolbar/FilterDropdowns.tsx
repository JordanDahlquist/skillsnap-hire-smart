
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

interface FilterDropdownsProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
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
      <Select value={statusFilter || 'all'} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-32 bg-card border-2 border-border/50 focus:ring-2 focus:ring-blue-500/50 rounded-2xl hover:bg-card hover:border-border/60 transition-all duration-300 text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)]">
          <Filter className="w-4 h-4 mr-1 text-foreground" />
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent className="bg-background border-2 border-border/50 shadow-[0_8px_24px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.15)] rounded-xl">
          {statusOptions.map((status) => (
            <SelectItem 
              key={status.value} 
              value={status.value} 
              className="text-foreground hover:bg-muted/80 focus:bg-muted/80 rounded-lg mx-1"
            >
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <MultiSelectDropdown
        options={workTypeOptions}
        selectedValues={workTypeFilter || ['all']}
        onSelectionChange={onWorkTypeFilterChange}
        placeholder="All Types"
        className="w-40"
      />
    </>
  );
};
