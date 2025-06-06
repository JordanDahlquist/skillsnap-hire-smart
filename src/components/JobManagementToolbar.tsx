
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
  RefreshCw
} from "lucide-react";

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
  onRefresh
}: JobManagementToolbarProps) => {
  const statusOptions = ['all', 'active', 'paused', 'draft', 'closed'];
  const sortOptions = [
    { value: 'created_desc', label: 'Newest first' },
    { value: 'created_asc', label: 'Oldest first' },
    { value: 'applications_desc', label: 'Most applications' },
    { value: 'applications_asc', label: 'Least applications' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Search and filters row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs by title, skills, or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => onStatusFilterChange(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats and bulk actions row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
  );
};
