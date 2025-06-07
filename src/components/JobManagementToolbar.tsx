
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Archive, 
  Trash2,
  Download,
  RefreshCw,
  MapPin
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobManagementToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalJobs: number;
  selectedJobs: string[];
  onBulkAction: (action: string) => void;
  onRefresh: () => void;
  locationFilter?: string;
  onLocationFilterChange?: (location: string) => void;
  workTypeFilter?: string;
  onWorkTypeFilterChange?: (workType: string) => void;
  needsAttentionFilter?: boolean;
  activeFiltersCount?: number;
}

export const JobManagementToolbar = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  totalJobs,
  selectedJobs,
  onBulkAction,
  onRefresh,
  locationFilter = 'all',
  onLocationFilterChange = () => {},
  workTypeFilter = 'all',
  onWorkTypeFilterChange = () => {},
  needsAttentionFilter = false,
  activeFiltersCount = 0
}: JobManagementToolbarProps) => {
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
  
  const sortOptions = [
    { value: 'created_desc', label: 'Newest first' },
    { value: 'created_asc', label: 'Oldest first' },
    { value: 'needs_attention', label: 'Needs attention' },
    { value: 'applications_desc', label: 'Most applications' },
    { value: 'applications_asc', label: 'Least applications' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' }
  ].filter(option => option.value && option.value.trim() !== '');

  // Get the current sort label
  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Sort by';

  return (
    <div className="bg-white border-b border-gray-200 py-5 space-y-4">
      <div className="max-w-7xl mx-auto px-8">
        {/* Search and filters row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 items-center">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs by title, skills, location..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
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
          </div>
          
          <div className="flex gap-2 items-center">
            <Select value={sortBy || 'created_desc'} onValueChange={onSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue>
                  {currentSortLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats and bulk actions row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center text-sm text-gray-600">
            <span>{totalJobs} total jobs</span>
            {selectedJobs.length > 0 && (
              <Badge variant="outline">
                {selectedJobs.length} selected
              </Badge>
            )}
            {activeFiltersCount > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </Badge>
            )}
            {needsAttentionFilter && (
              <Badge className="bg-orange-100 text-orange-600">
                Showing jobs needing attention
              </Badge>
            )}
          </div>
          
          {selectedJobs.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onBulkAction('activate')}
              >
                Activate Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onBulkAction('pause')}
              >
                Pause Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onBulkAction('archive')}
              >
                <Archive className="w-4 h-4 mr-1" />
                Archive Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onBulkAction('export')}
              >
                <Download className="w-4 h-4 mr-1" />
                Export Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
