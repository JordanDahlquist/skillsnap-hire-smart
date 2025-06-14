
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, FileText, Play, Pause, Archive, Loader2 } from "lucide-react";
import { useThemeContext } from "@/contexts/ThemeContext";

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
  size?: "sm" | "default";
}

const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "bg-muted text-muted-foreground",
    buttonColor: "text-muted-foreground border-border"
  },
  active: {
    label: "Active",
    icon: Play,
    color: "bg-success/10 text-success",
    buttonColor: "text-success border-success/20"
  },
  paused: {
    label: "Paused",
    icon: Pause,
    color: "bg-warning/10 text-warning",
    buttonColor: "text-warning border-warning/20"
  },
  closed: {
    label: "Closed",
    icon: Archive,
    color: "bg-destructive/10 text-destructive",
    buttonColor: "text-destructive border-destructive/20"
  }
};

export const StatusDropdown = ({ 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  size = "default"
}: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme } = useThemeContext();
  const currentConfig = statusConfig[currentStatus as keyof typeof statusConfig];
  const CurrentIcon = currentConfig?.icon || FileText;

  const handleStatusSelect = (newStatus: string) => {
    console.log('Status selected from dropdown:', { from: currentStatus, to: newStatus });
    
    // Don't proceed if disabled or same status
    if (disabled || newStatus === currentStatus) {
      console.log('Status change blocked:', { disabled, sameStatus: newStatus === currentStatus });
      return;
    }
    
    setIsOpen(false);
    onStatusChange(newStatus);
  };

  // Get theme-aware button color class
  const getButtonColorClass = () => {
    if (currentTheme === 'black') {
      // In black mode, use white text for all status buttons
      return "text-white border-white/20 hover:bg-white/10";
    }
    return currentConfig?.buttonColor || "text-muted-foreground border-border";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled}
          className={`${getButtonColorClass()} hover:bg-accent ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CurrentIcon className="w-4 h-4 mr-2" />
          )}
          {currentConfig?.label || currentStatus}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border shadow-lg z-50">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          const isCurrentStatus = currentStatus === status;
          
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={`${isCurrentStatus ? "bg-accent" : ""} hover:bg-accent/80 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={disabled}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{config.label}</span>
              {isCurrentStatus && (
                <Badge className={`ml-auto ${config.color} text-xs`}>
                  Current
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
