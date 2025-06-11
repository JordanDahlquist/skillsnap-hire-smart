
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, SortAsc, Settings, RefreshCw, Archive, Download, X } from "lucide-react";

interface JobManagementModalProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  workTypeFilter: string;
  onWorkTypeFilterChange: (workType: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalJobs: number;
  selectedJobs: string[];
  onBulkAction: (action: string) => void;
  onRefresh: () => void;
  needsAttentionFilter: boolean;
  activeFiltersCount: number;
}

export const JobManagementModal = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  workTypeFilter,
  onWorkTypeFilterChange,
  sortBy,
  onSortChange,
  totalJobs,
  selectedJobs,
  onBulkAction,
  onRefresh,
  needsAttentionFilter,
  activeFiltersCount
}: JobManagementModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
    { value: 'needs_attention', label: 'Needs attention' },
    { value: 'applications_desc', label: 'Most applications' },
    { value: 'applications_asc', label: 'Least applications' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' }
  ];

  const getActiveFiltersText = () => {
    const filters = [];
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    if (statusFilter !== 'all') filters.push(`Status: ${statusFilter}`);
    if (workTypeFilter !== 'all') filters.push(`Type: ${workTypeFilter}`);
    if (needsAttentionFilter) filters.push('Needs attention');
    return filters.length > 0 ? filters.join(', ') : 'No filters applied';
  };

  const getSummaryText = () => {
    const parts = [];
    if (selectedJobs.length > 0) parts.push(`${selectedJobs.length} selected`);
    if (activeFiltersCount > 0) parts.push(`${activeFiltersCount} filters`);
    parts.push(`${totalJobs} total jobs`);
    return parts.join(' • ');
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onWorkTypeFilterChange('all');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="glass-card backdrop-blur-xl bg-gradient-to-br from-white/30 via-white/20 to-white/10 border-2 border-white/40 shadow-lg hover:bg-white/40 transition-all duration-300"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Jobs
          {(activeFiltersCount > 0 || selectedJobs.length > 0) && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount + (selectedJobs.length > 0 ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Job Management
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{getSummaryText()}</p>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sort" className="flex items-center gap-2">
              <SortAsc className="w-4 h-4" />
              Sort
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Actions
              {selectedJobs.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedJobs.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Search Jobs</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by job title, description, skills..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => onSearchChange('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-muted-foreground">
                  Searching for: "{searchTerm}"
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Status</label>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Work Type</label>
                <Select value={workTypeFilter} onValueChange={onWorkTypeFilterChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm font-medium">Active Filters</p>
                <p className="text-xs text-muted-foreground">{getActiveFiltersText()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sort" className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Sort Jobs By</label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {selectedJobs.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedJobs.length} jobs selected</p>
                    <p className="text-sm text-muted-foreground">Choose an action to apply to all selected jobs</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => onBulkAction('activate')}
                    className="justify-start"
                  >
                    Activate Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onBulkAction('pause')}
                    className="justify-start"
                  >
                    Pause Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onBulkAction('archive')}
                    className="justify-start"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onBulkAction('export')}
                    className="justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No jobs selected</p>
                <p className="text-sm">Select jobs from the list to see bulk actions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
