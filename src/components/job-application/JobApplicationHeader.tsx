
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Clock, Users, Eye } from "lucide-react";
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
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {job.title}
        </h1>
        
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-sm">
            {job.role_type}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {job.experience_level}
          </Badge>
        </div>
        
        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{getLocationDisplay()}</span>
          </div>
          {job.budget && (
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <DollarSign className="w-4 h-4" />
              <span>{job.budget}</span>
            </div>
          )}
          {job.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{job.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{applicationsCount} application{applicationsCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{job.view_count || 0} view{(job.view_count || 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Posted {getTimeAgo(job.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
