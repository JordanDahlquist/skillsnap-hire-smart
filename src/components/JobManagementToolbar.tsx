
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
  onWorkTypeFilterChange = () => {}
}: JobManagementToolbarProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'draft', label: 'Draft' },
    { value: 'closed', label: 'Closed' }
  ];
  
  const workTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'remote', label: 'Remote' },
    { value: 'on-site', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' }
  ];
  
  const sortOptions = [
    { value: 'created_desc', label: 'Newest first' },
    { value: 'created_asc', label: 'Oldest first' },
    { value: 'applications_desc', label: 'Most applications' },
    { value: 'applications_asc', label: 'Least applications' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-5 space-y-4">
      <div className="max-w-7xl mx-auto">
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
            
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 items-center">
            <Select value={workTypeFilter} onValueChange={onWorkTypeFilterChange}>
              <SelectTrigger className="w-32">
                <MapPin className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
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
