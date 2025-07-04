
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, ChevronDown } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MultiSelectDropdown = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options",
  icon = <MapPin className="w-4 h-4" />,
  className = "w-40"
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayValue = () => {
    if (!selectedValues || selectedValues.includes('all') || selectedValues.length === 0) {
      return placeholder;
    }
    
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || placeholder;
    }
    
    if (selectedValues.length === 2) {
      const labels = selectedValues.map(value => 
        options.find(opt => opt.value === value)?.label
      ).filter(Boolean);
      return labels.join(' + ');
    }
    
    const firstLabel = options.find(opt => opt.value === selectedValues[0])?.label;
    return `${firstLabel} + ${selectedValues.length - 1} more`;
  };

  const handleToggleOption = (value: string) => {
    if (value === 'all') {
      onSelectionChange(['all']);
      return;
    }
    
    const currentFilter = selectedValues.filter(item => item !== 'all');
    
    if (currentFilter.includes(value)) {
      const newFilter = currentFilter.filter(item => item !== value);
      onSelectionChange(newFilter.length === 0 ? ['all'] : newFilter);
    } else {
      onSelectionChange([...currentFilter, value]);
    }
  };

  const isChecked = (value: string) => {
    if (value === 'all') {
      return selectedValues.includes('all') || selectedValues.length === 0;
    }
    return selectedValues.includes(value);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`${className} justify-between bg-card border-2 border-border/50 focus:ring-2 focus:ring-blue-500/50 rounded-2xl hover:bg-card hover:border-border/60 transition-all duration-300 text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)]`}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="truncate">{getDisplayValue()}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-background border-2 border-border/50 shadow-[0_8px_24px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.15)] rounded-xl">
        <div className="p-2">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 rounded-lg px-2 py-2 hover:bg-muted/80 cursor-pointer"
              onClick={() => handleToggleOption(option.value)}
            >
              <Checkbox 
                checked={isChecked(option.value)}
                onChange={() => {}}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
