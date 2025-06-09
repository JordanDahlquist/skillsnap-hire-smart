
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
    color: "bg-gray-100 text-gray-800",
    buttonColor: "text-gray-600 border-gray-200"
  },
  active: {
    label: "Active",
    icon: Play,
    color: "bg-green-100 text-green-800",
    buttonColor: "text-green-600 border-green-200"
  },
  paused: {
    label: "Paused",
    icon: Pause,
    color: "bg-yellow-100 text-yellow-800",
    buttonColor: "text-yellow-600 border-yellow-200"
  },
  closed: {
    label: "Closed",
    icon: Archive,
    color: "bg-red-100 text-red-800",
    buttonColor: "text-red-600 border-red-200"
  }
};

export const StatusDropdown = ({ 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  size = "default"
}: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled}
          className={`${currentConfig?.buttonColor} hover:bg-gray-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      <DropdownMenuContent align="end" className="bg-white border shadow-lg">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          const isCurrentStatus = currentStatus === status;
          
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={`${isCurrentStatus ? "bg-gray-50" : ""} hover:bg-gray-100 cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
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
