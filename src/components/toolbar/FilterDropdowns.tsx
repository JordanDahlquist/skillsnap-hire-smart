
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
        <SelectTrigger className="w-32 bg-transparent border-0 focus:ring-0 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 text-black">
          <Filter className="w-4 h-4 mr-1 text-black" />
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-sm border-white/40 shadow-lg">
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value} className="text-gray-900 hover:bg-gray-100">
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={workTypeFilter || 'all'} onValueChange={onWorkTypeFilterChange}>
        <SelectTrigger className="w-32 bg-transparent border-0 focus:ring-0 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 text-black">
          <MapPin className="w-4 h-4 mr-1 text-black" />
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-sm border-white/40 shadow-lg">
          {workTypeOptions.map((type) => (
            <SelectItem key={type.value} value={type.value} className="text-gray-900 hover:bg-gray-100">
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};
