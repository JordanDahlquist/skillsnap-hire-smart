
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, ArrowUpDown } from "lucide-react";

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
  const sortOptions = [
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'created_at', label: 'Newest First' },
    { value: 'needs_attention', label: 'Needs Attention' },
    { value: 'applications', label: 'Most Applications' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'budget', label: 'Budget' }
  ].filter(option => option.value && option.value.trim() !== '');

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Sort by';

  const handleSortOrderToggle = () => {
    if (onSortOrderChange) {
      onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  const handleSortChange = (newSortBy: string) => {
    console.log('SortControls: Sort change to', newSortBy);
    onSortChange(newSortBy);
  };

  return (
    <div className="flex gap-2 items-center">
      <Select value={sortBy || 'updated_at'} onValueChange={handleSortChange}>
        <SelectTrigger className="w-40 bg-transparent border-0 focus:ring-0 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 text-foreground">
          <SelectValue>
            {currentSortLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background backdrop-blur-sm border-border shadow-lg">
          {sortOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value} 
              className="text-foreground hover:bg-muted"
            >
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
          className="rounded-2xl backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300 text-foreground hover:text-foreground"
          title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'} - Click to ${sortOrder === 'asc' ? 'sort descending' : 'sort ascending'}`}
        >
          <ArrowUpDown className={`w-4 h-4 text-foreground ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="rounded-2xl backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300 text-foreground hover:text-foreground"
      >
        <RefreshCw className="w-4 h-4 text-foreground" />
      </Button>
    </div>
  );
};
