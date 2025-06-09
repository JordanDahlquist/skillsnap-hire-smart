
import { Link } from "react-router-dom";
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { Job } from "@/types";

interface JobCardHeaderProps {
  job: Job;
  needsAttention: boolean;
  status: string;
  onStatusChange: (newStatus: string) => void;
  isUpdating: boolean;
  applicationsCount: number;
}

export const JobCardHeader = ({ 
  job, 
  needsAttention, 
  status, 
  onStatusChange, 
  isUpdating, 
  applicationsCount 
}: JobCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <CardTitle className="text-xl">
            <Link 
              to={`/dashboard/${job.id}`}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              {job.title}
            </Link>
          </CardTitle>
          {needsAttention && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-xs font-medium">
              <Bell className="w-3 h-3" />
              <span>Needs attention</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
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
    </div>
  );
};
