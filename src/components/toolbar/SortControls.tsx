
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ArrowUpDown } from "lucide-react";
import { useThemeContext } from "@/contexts/ThemeContext";

interface SortControlsProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  onRefresh: () => void;
}

export const SortControls = ({ 
  sortBy, 
  onSortChange, 
  sortOrder = "desc",
  onSortOrderChange,
  onRefresh 
}: SortControlsProps) => {
  const { currentTheme } = useThemeContext();
  
  const sortOptions = [
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'created_at', label: 'Newest First' },
    { value: 'needs_attention', label: 'Needs Attention' },
    { value: 'applications', label: 'Most Applications' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'budget', label: 'Budget' }
  ].filter(option => option.value && option.value.trim() !== '');

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Sort by';
  
  const textColor = currentTheme === 'dark' ? 'text-white' : 'text-black';
  const iconColor = currentTheme === 'dark' ? 'text-white' : 'text-black';

  const handleSortOrderToggle = () => {
    if (onSortOrderChange) {
      onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  // Set default sort order based on sort type
  const handleSortChange = (newSortBy: string) => {
    onSortChange(newSortBy);
    
    // Set appropriate default sort order for different sort types
    if (onSortOrderChange) {
      if (newSortBy === 'applications' || newSortBy === 'needs_attention' || newSortBy === 'budget') {
        onSortOrderChange('desc'); // High to low for numbers
      } else if (newSortBy === 'title') {
        onSortOrderChange('asc'); // A to Z for titles
      } else {
        onSortOrderChange('desc'); // Most recent first for dates
      }
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Select value={sortBy || 'updated_at'} onValueChange={handleSortChange}>
        <SelectTrigger className={`w-40 bg-transparent border-0 focus:ring-0 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 ${textColor}`}>
          <SelectValue>
            {currentSortLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-sm border-white/40 shadow-lg">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-gray-900 hover:bg-gray-100">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {onSortOrderChange && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSortOrderToggle}
          className={`rounded-2xl backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300 ${textColor} hover:${textColor}`}
          title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
        >
          <ArrowUpDown className={`w-4 h-4 ${iconColor} ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className={`rounded-2xl backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300 ${textColor} hover:${textColor}`}
      >
        <RefreshCw className={`w-4 h-4 ${iconColor}`} />
      </Button>
    </div>
  );
};
