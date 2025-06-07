
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, MapPin } from "lucide-react";

interface FilterDropdownsProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  workTypeFilter: string;
  onWorkTypeFilterChange: (workType: string) => void;
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
    { value: 'closed', label: 'Closed' }
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
        <SelectTrigger className="w-32">
          <Filter className="w-4 h-4 mr-1" />
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={workTypeFilter || 'all'} onValueChange={onWorkTypeFilterChange}>
        <SelectTrigger className="w-32">
          <MapPin className="w-4 h-4 mr-1" />
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {workTypeOptions.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};
