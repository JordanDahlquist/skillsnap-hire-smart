
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

interface SortControlsProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  onRefresh: () => void;
}

export const SortControls = ({ sortBy, onSortChange, onRefresh }: SortControlsProps) => {
  const sortOptions = [
    { value: 'created_desc', label: 'Newest first' },
    { value: 'created_asc', label: 'Oldest first' },
    { value: 'needs_attention', label: 'Needs attention' },
    { value: 'applications_desc', label: 'Most applications' },
    { value: 'applications_asc', label: 'Least applications' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' }
  ].filter(option => option.value && option.value.trim() !== '');

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Sort by';

  return (
    <div className="flex gap-2 items-center">
      <Select value={sortBy || 'created_desc'} onValueChange={onSortChange}>
        <SelectTrigger className="w-40 bg-transparent border-0 focus:ring-0 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300">
          <SelectValue>
            {currentSortLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="glass-card border-white/40">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="rounded-2xl backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  );
};
