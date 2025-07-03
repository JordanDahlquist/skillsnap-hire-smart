
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, Trash2, X } from "lucide-react";
import type { InboxFilter } from "@/hooks/useInboxFilters";

interface BulkActionsToolbarProps {
  selectedCount: number;
  currentFilter: InboxFilter;
  onArchiveSelected: () => void;
  onUnarchiveSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export const BulkActionsToolbar = ({
  selectedCount,
  currentFilter,
  onArchiveSelected,
  onUnarchiveSelected,
  onDeleteSelected,
  onClearSelection
}: BulkActionsToolbarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <span className="font-medium">{selectedCount} thread{selectedCount !== 1 ? 's' : ''} selected</span>
        </div>
        
        <div className="flex items-center gap-2">
          {currentFilter !== 'archived' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onArchiveSelected}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <Archive className="w-4 h-4 mr-1" />
              Archive
            </Button>
          )}
          
          {currentFilter !== 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUnarchiveSelected}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <ArchiveRestore className="w-4 h-4 mr-1" />
              Unarchive
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
