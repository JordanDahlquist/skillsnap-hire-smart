
import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useThemeContext } from "@/contexts/ThemeContext";

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
  const { currentTheme } = useThemeContext();
  
  return (
    <div className="relative w-full">
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
        currentTheme === 'dark' ? 'text-white' : 'text-black'
      }`} />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`pl-10 w-full rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 focus:ring-0 focus-visible:ring-0 ${
          currentTheme === 'dark' 
            ? 'placeholder:text-white/70 text-white' 
            : 'placeholder:text-black/70 text-black'
        }`}
      />
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
