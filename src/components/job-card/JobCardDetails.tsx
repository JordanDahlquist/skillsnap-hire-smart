
import { MapPin, Eye, TrendingUp, Calendar } from "lucide-react";
import { Job } from "@/types";

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
  const displayEmploymentType = job.employment_type || job.role_type;
  
  // Use the real view_count from the database
  const viewCount = job.view_count || 0;

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
          <span>12% response rate</span>
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
          {applicationsCount > 0 && (
            <span className="text-gray-500">
              (+{Math.floor(Math.random() * 5) + 1} this week)
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
