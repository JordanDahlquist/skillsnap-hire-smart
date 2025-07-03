
import { useState } from "react";
import { Search, RefreshCw, Mail, Clock, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThreadList } from "./ThreadList";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { useOptimizedEmailSubjects } from "@/hooks/useOptimizedEmailSubjects";
import type { EmailThread } from "@/types/inbox";
import type { InboxFilter } from "@/hooks/useInboxFilters";

interface InboxContentProps {
  threads: EmailThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onMarkAsRead: (threadId: string) => void;
  onRefresh: () => void;
  // Filter props
  currentFilter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  // Thread operations
  onArchiveThread: (threadId: string) => void;
  onUnarchiveThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onBulkArchive: (threadIds: string[]) => void;
  onBulkUnarchive: (threadIds: string[]) => void;
  onBulkDelete: (threadIds: string[]) => void;
  // Selection
  selectedThreadIds: string[];
  onToggleThreadSelection: (threadId: string) => void;
  onClearSelection: () => void;
  // Auto-refresh props
  isAutoRefreshEnabled?: boolean;
  toggleAutoRefresh?: () => void;
  lastRefreshTime?: Date;
  isAutoRefreshing?: boolean;
  isTabVisible?: boolean;
}

export const InboxContent = ({
  threads,
  selectedThreadId,
  onSelectThread,
  onMarkAsRead,
  onRefresh,
  currentFilter,
  onFilterChange,
  onArchiveThread,
  onUnarchiveThread,
  onDeleteThread,
  onBulkArchive,
  onBulkUnarchive,
  onBulkDelete,
  selectedThreadIds,
  onToggleThreadSelection,
  onClearSelection,
  isAutoRefreshEnabled = false,
  toggleAutoRefresh,
  lastRefreshTime,
  isAutoRefreshing = false,
  isTabVisible = true
}: InboxContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [threadsToDelete, setThreadsToDelete] = useState<string[]>([]);

  // Process email subjects for template variables
  const { processedThreads } = useOptimizedEmailSubjects(threads);

  const filteredThreads = processedThreads.filter(thread =>
    thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.participants.some(p => 
      typeof p === 'string' ? p.toLowerCase().includes(searchTerm.toLowerCase()) : false
    )
  );

  // Calculate thread counts
  const activeTotalUnread = threads.filter(t => t.status === 'active').reduce((sum, thread) => sum + thread.unread_count, 0);
  const activeCount = threads.filter(t => t.status === 'active').length;
  const archivedCount = threads.filter(t => t.status === 'archived').length;
  const totalCount = threads.length;

  const formatLastRefreshTime = (time: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    return time.toLocaleString();
  };

  const handleDeleteConfirm = () => {
    if (threadsToDelete.length === 1) {
      onDeleteThread(threadsToDelete[0]);
    } else {
      onBulkDelete(threadsToDelete);
    }
    onClearSelection();
    setThreadsToDelete([]);
  };

  const handleSingleDelete = (threadId: string) => {
    setThreadsToDelete([threadId]);
    setDeleteModalOpen(true);
  };

  const handleBulkDeleteSelected = () => {
    setThreadsToDelete(selectedThreadIds);
    setDeleteModalOpen(true);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Fixed Header with Tabs and Controls */}
      <CardHeader className="pb-3 flex-shrink-0 border-b bg-background">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Inbox
            {currentFilter === 'active' && activeTotalUnread > 0 && (
              <Badge variant="destructive">{activeTotalUnread}</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Auto-refresh status indicator */}
            {isAutoRefreshEnabled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className={`w-3 h-3 ${isAutoRefreshing ? 'animate-spin' : ''}`} />
                      <span className={`w-2 h-2 rounded-full ${isTabVisible ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div>Auto-refresh: {isAutoRefreshEnabled ? 'On' : 'Off'}</div>
                      <div>Status: {isTabVisible ? 'Active (2 min)' : 'Background (10 min)'}</div>
                      {lastRefreshTime && (
                        <div>Last refresh: {formatLastRefreshTime(lastRefreshTime)}</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Auto-refresh toggle */}
            {toggleAutoRefresh && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleAutoRefresh}
                      className={`h-8 w-8 p-0 ${isAutoRefreshEnabled ? 'text-green-600' : 'text-muted-foreground'}`}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isAutoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Manual refresh button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Refresh inbox manually
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <Tabs value={currentFilter} onValueChange={(value) => onFilterChange(value as InboxFilter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active
              {activeCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              Archived
              {archivedCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {archivedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              {totalCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {totalCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status bar */}
        {lastRefreshTime && (
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Last updated: {formatLastRefreshTime(lastRefreshTime)}</span>
            {isAutoRefreshing && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Refreshing...
              </span>
            )}
          </div>
        )}
      </CardHeader>

      {/* Scrollable Content Area */}
      <CardContent className="flex-1 min-h-0 p-0">
        <div className="p-4">
          {/* Bulk Actions Toolbar */}
          <BulkActionsToolbar
            selectedCount={selectedThreadIds.length}
            currentFilter={currentFilter}
            onArchiveSelected={() => onBulkArchive(selectedThreadIds)}
            onUnarchiveSelected={() => onBulkUnarchive(selectedThreadIds)}
            onDeleteSelected={handleBulkDeleteSelected}
            onClearSelection={onClearSelection}
          />
        </div>

        <ScrollArea className="h-full">
          <ThreadList
            threads={filteredThreads}
            selectedThreadId={selectedThreadId}
            onSelectThread={onSelectThread}
            onMarkAsRead={onMarkAsRead}
            selectedThreadIds={selectedThreadIds}
            onToggleThreadSelection={onToggleThreadSelection}
            onArchiveThread={onArchiveThread}
            onUnarchiveThread={onUnarchiveThread}
            onDeleteThread={handleSingleDelete}
          />
        </ScrollArea>
      </CardContent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        threadCount={threadsToDelete.length}
      />
    </Card>
  );
};
