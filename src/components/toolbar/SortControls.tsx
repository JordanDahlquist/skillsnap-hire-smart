
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
        <SelectTrigger className="w-40 bg-card/80 border-2 border-border/50 focus:ring-2 focus:ring-blue-500/50 rounded-2xl backdrop-blur-sm hover:bg-card/90 hover:border-border/60 transition-all duration-300 text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)]">
          <SelectValue>
            {currentSortLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background/95 backdrop-blur-sm border-2 border-border/50 shadow-[0_8px_24px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.15)] rounded-xl">
          {sortOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value} 
              className="text-foreground hover:bg-muted/80 focus:bg-muted/80 rounded-lg mx-1"
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
          className="rounded-2xl backdrop-blur-sm bg-card/80 border-2 border-border/50 hover:bg-card/90 hover:border-border/60 transition-all duration-300 text-foreground hover:text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)]"
          title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'} - Click to ${sortOrder === 'asc' ? 'sort descending' : 'sort ascending'}`}
        >
          <ArrowUpDown className={`w-4 h-4 text-foreground ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="rounded-2xl backdrop-blur-sm bg-card/80 border-2 border-border/50 hover:bg-card/90 hover:border-border/60 transition-all duration-300 text-foreground hover:text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)]"
      >
        <RefreshCw className="w-4 h-4 text-foreground" />
      </Button>
    </div>
  );
};
