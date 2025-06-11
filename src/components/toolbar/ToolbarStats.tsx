
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
    <div className="rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 px-4 py-2">
      <div className="flex gap-4 items-center text-sm text-white">
        {selectedCount > 0 && (
          <span className="font-medium">
            {selectedCount} selected
          </span>
        )}
        {activeFiltersCount > 0 && (
          <Badge 
            variant="outline" 
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300"
          >
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </Badge>
        )}
        {needsAttentionFilter && (
          <Badge className="bg-orange-500/80 text-white border-orange-400/50 hover:bg-orange-500/90 transition-all duration-300">
            Showing jobs needing attention
          </Badge>
        )}
        <span className="text-white/80">
          {totalJobs} total job{totalJobs !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
});

ToolbarStats.displayName = 'ToolbarStats';
