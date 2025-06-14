
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { useThemeContext } from "@/contexts/ThemeContext";

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
  const { currentTheme } = useThemeContext();
  
  // Theme-aware colors
  const textColor = currentTheme === 'dark' || currentTheme === 'black' ? 'text-white' : 'text-black';
  
  return (
    <div className={`flex gap-4 items-center text-sm ${textColor}`}>
      {selectedCount > 0}
      {activeFiltersCount > 0 && (
        <Badge 
          variant="outline" 
          className={
            currentTheme === 'dark' || currentTheme === 'black' 
              ? "bg-blue-900/50 text-blue-300 border-blue-700" 
              : "bg-blue-50 text-blue-600"
          }
        >
          {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
        </Badge>
      )}
      {needsAttentionFilter && (
        <Badge 
          className={
            currentTheme === 'dark' || currentTheme === 'black' 
              ? "bg-orange-900/50 text-orange-300" 
              : "bg-orange-100 text-orange-600"
          }
        >
          Showing jobs needing attention
        </Badge>
      )}
    </div>
  );
});

ToolbarStats.displayName = 'ToolbarStats';
