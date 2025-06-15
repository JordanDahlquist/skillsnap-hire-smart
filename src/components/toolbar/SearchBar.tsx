
import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = memo(({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search by name, email..." 
}: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 text-foreground" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full rounded-2xl backdrop-blur-sm bg-white/30 border-2 border-white/50 hover:bg-white/40 hover:border-white/60 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/50 placeholder:text-muted-foreground text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)] focus:shadow-[0_8px_20px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.2)]"
      />
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
