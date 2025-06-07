
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "closed": return "bg-red-100 text-red-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
        <StatusDropdown
          currentStatus={status}
          onStatusChange={onStatusChange}
          disabled={isUpdating}
          size="sm"
        />
      </div>
      {applicationsCount > 10 && !needsAttention && (
        <Badge variant="outline" className="text-green-600 border-green-200">
          High Interest
        </Badge>
      )}
    </div>
  );
};
