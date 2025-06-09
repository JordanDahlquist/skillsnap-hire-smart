
import { Badge } from "@/components/ui/badge";
import { StatusDropdown } from "@/components/ui/status-dropdown";

interface JobCardStatusProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
  isUpdating: boolean;
  applicationsCount: number;
  needsAttention: boolean;
}

export const JobCardStatus = ({ 
  status, 
  onStatusChange, 
  isUpdating, 
  applicationsCount, 
  needsAttention 
}: JobCardStatusProps) => {
  return (
    <div className="flex items-center justify-end gap-2">
      {applicationsCount > 10 && !needsAttention && (
        <Badge variant="outline" className="text-green-600 border-green-200">
          High Interest
        </Badge>
      )}
      <StatusDropdown
        currentStatus={status}
        onStatusChange={onStatusChange}
        disabled={isUpdating}
        size="sm"
      />
    </div>
  );
};
