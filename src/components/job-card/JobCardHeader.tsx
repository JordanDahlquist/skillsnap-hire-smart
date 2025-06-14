
import { Link } from "react-router-dom";
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Star } from "lucide-react";
import { StatusDropdown } from "@/components/ui/status-dropdown";
import { Job } from "@/types";

interface JobCardHeaderProps {
  job: Job;
  needsAttention: boolean;
  status: string;
  onStatusChange: (newStatus: string) => void;
  isUpdating: boolean;
  applicationsCount: number;
  isSelected?: boolean;
  onJobSelection?: (checked: boolean) => void;
}

export const JobCardHeader = ({ 
  job, 
  needsAttention, 
  status, 
  onStatusChange, 
  isUpdating, 
  applicationsCount,
  isSelected = false,
  onJobSelection
}: JobCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1">
        {onJobSelection && (
          <div className="flex items-start pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onJobSelection}
            />
          </div>
        )}
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
            <div className="flex items-center gap-2">
              {job.needsReview && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-md text-xs font-medium">
                  <Star className="w-3 h-3" />
                  <span>Needs review</span>
                </div>
              )}
              {needsAttention && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-xs font-medium">
                  <Bell className="w-3 h-3" />
                  <span>Needs attention</span>
                </div>
              )}
            </div>
          </div>
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
