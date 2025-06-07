
import { memo } from "react";
import { Badge } from "@/components/ui/badge";

interface ToolbarStatsProps {
  totalJobs: number;
  selectedCount: number;
  activeFiltersCount: number;
  needsAttentionFilter: boolean;
}

export const ToolbarStats = memo(({ 
  totalJobs, 
  selectedCount, 
  activeFiltersCount, 
  needsAttentionFilter 
}: ToolbarStatsProps) => {
  return (
    <div className="flex gap-4 items-center text-sm text-gray-600">
      <span>{totalJobs} total jobs</span>
      {selectedCount > 0 && (
        <Badge variant="outline">
          {selectedCount} selected
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
  );
});

ToolbarStats.displayName = 'ToolbarStats';
