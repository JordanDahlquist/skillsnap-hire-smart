
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, FileText, Play, Pause, Archive } from "lucide-react";

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
  const currentConfig = statusConfig[currentStatus as keyof typeof statusConfig];
  const CurrentIcon = currentConfig?.icon || FileText;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled}
          className={`${currentConfig?.buttonColor} hover:bg-gray-50`}
        >
          <CurrentIcon className="w-4 h-4 mr-2" />
          {currentConfig?.label || currentStatus}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => onStatusChange(status)}
              className={currentStatus === status ? "bg-gray-50" : ""}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span>{config.label}</span>
              {currentStatus === status && (
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
