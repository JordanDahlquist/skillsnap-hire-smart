
import { Button } from "@/components/ui/button";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { Pencil, Copy, Archive, X } from "lucide-react";
import { Job } from "@/types";

interface MobileJobCardActionsProps {
  job: Job;
  onStatusChange: (newStatus: string) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  isUpdating: boolean;
  onClose: () => void;
}

export const MobileJobCardActions = ({
  job,
  onStatusChange,
  onEdit,
  onDuplicate,
  onArchive,
  isUpdating,
  onClose
}: MobileJobCardActionsProps) => {
  return (
    <div className="space-y-3">
      {/* Status Dropdown */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Job Status
        </label>
        <StatusDropdown
          currentStatus={job.status}
          onStatusChange={onStatusChange}
          disabled={isUpdating}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          onClick={onEdit}
          disabled={isUpdating}
          className="h-11 justify-start"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          onClick={onDuplicate}
          disabled={isUpdating}
          className="h-11 justify-start"
        >
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </Button>
      </div>

      <Button 
        variant="outline" 
        onClick={onArchive}
        disabled={isUpdating}
        className="w-full h-11 justify-start"
      >
        <Archive className="w-4 h-4 mr-2" />
        Archive Job
      </Button>

      {/* Close Button */}
      <Button 
        variant="ghost" 
        onClick={onClose}
        className="w-full h-11 justify-center"
      >
        <X className="w-4 h-4 mr-2" />
        Close
      </Button>
    </div>
  );
};
