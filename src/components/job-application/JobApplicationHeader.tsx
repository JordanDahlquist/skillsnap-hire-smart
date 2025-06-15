
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Clock, Users, Eye } from "lucide-react";
import { getJobStatusColor } from "@/utils/statusUtils";
import { Job } from "@/types";

interface JobApplicationHeaderProps {
  job: Job;
  applicationsCount: number;
  getLocationDisplay: () => string;
  getTimeAgo: (dateString: string) => string;
}

export const JobApplicationHeader = ({ 
  job, 
  applicationsCount, 
  getLocationDisplay, 
  getTimeAgo 
}: JobApplicationHeaderProps) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Open for Applications';
      case 'paused':
        return 'Applications Paused';
      case 'closed':
        return 'Applications Closed';
      case 'draft':
        return 'Draft - Not Published';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="bg-white border-b border-border pb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-foreground text-left">
              {job.title}
            </h1>
            <Badge className={getJobStatusColor(job.status)}>
              {getStatusLabel(job.status)}
            </Badge>
          </div>
          
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-sm bg-blue-50 text-blue-700 border-blue-200">
              {job.role_type}
            </Badge>
            <Badge variant="outline" className="text-sm border-gray-300 text-gray-700">
              {job.experience_level}
            </Badge>
          </div>
          
          <div className="flex items-center flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-foreground">{getLocationDisplay()}</span>
            </div>
            {job.budget && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <DollarSign className="w-4 h-4" />
                <span>{job.budget}</span>
              </div>
            )}
            {job.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-foreground">{job.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-foreground">{applicationsCount} application{applicationsCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-foreground">{job.view_count || 0} view{(job.view_count || 0) !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-foreground">Posted {getTimeAgo(job.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
