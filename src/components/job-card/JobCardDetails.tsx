
import { MapPin, Eye, TrendingUp, Calendar } from "lucide-react";
import { Job } from "@/types";
import { useJobMetrics } from "@/hooks/useJobMetrics";

interface JobCardDetailsProps {
  job: Job;
  getLocationDisplay: () => string;
  getTimeAgo: (dateString: string) => string;
  applicationsCount: number;
}

export const JobCardDetails = ({ 
  job, 
  getLocationDisplay, 
  getTimeAgo, 
  applicationsCount 
}: JobCardDetailsProps) => {
  const { data: metrics } = useJobMetrics(job.id);
  
  const displayEmploymentType = job.employment_type || job.role_type;
  
  // Use the real view_count from the database
  const viewCount = job.view_count || 0;
  
  // Use real metrics or defaults
  const responseRate = metrics?.responseRate ?? 0;
  const weeklyApplications = metrics?.weeklyApplications ?? 0;

  return (
    <>
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
        <span>{displayEmploymentType} • {job.experience_level}</span>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{getLocationDisplay()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{viewCount} views</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{responseRate}% response rate</span>
        </div>
        {job.budget && (
          <div className="flex items-center gap-1 text-green-600">
            <span className="font-medium">{job.budget}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-blue-600">
          <span className="font-medium">{applicationsCount} applications</span>
          {weeklyApplications > 0 && (
            <span className="text-gray-500">
              (+{weeklyApplications} this week)
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Created {getTimeAgo(job.created_at)}</span>
        </div>
      </div>
    </>
  );
};
