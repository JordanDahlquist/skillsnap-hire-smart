
import { Star } from "lucide-react";
import { ApplicationsList } from "./ApplicationsList";
import { ApplicationDetail } from "./ApplicationDetail";
import { getTimeAgo } from "@/utils/dateUtils";

interface Application {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  created_at: string;
  ai_rating: number | null;
  ai_summary: string | null;
  status: string;
  experience: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
  manual_rating: number | null;
  rejection_reason: string | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  role_type: string;
  experience_level: string;
  required_skills: string;
  budget: string;
  duration: string;
  status: string;
  created_at: string;
}

interface ApplicationsManagerProps {
  applications: Application[];
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  selectedApplications: string[];
  onSelectApplications: (applications: string[]) => void;
  onSendEmail: () => void;
  onApplicationUpdate: () => void;
  job: Job;
}

export const ApplicationsManager = ({
  applications,
  selectedApplication,
  onSelectApplication,
  selectedApplications,
  onSelectApplications,
  onSendEmail,
  onApplicationUpdate,
  job
}: ApplicationsManagerProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingStars = (rating: number | null) => {
    const ratingValue = rating || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(ratingValue) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <ApplicationsList 
          applications={applications}
          selectedApplication={selectedApplication}
          onSelectApplication={onSelectApplication}
          getStatusColor={getStatusColor}
          getRatingStars={getRatingStars}
          getTimeAgo={getTimeAgo}
          selectedApplications={selectedApplications}
          onSelectApplications={onSelectApplications}
          onSendEmail={onSendEmail}
        />
      </div>

      <div className="lg:col-span-2">
        <ApplicationDetail 
          selectedApplication={selectedApplication}
          applications={applications}
          job={job}
          getStatusColor={getStatusColor}
          getRatingStars={getRatingStars}
          getTimeAgo={getTimeAgo}
          onApplicationUpdate={onApplicationUpdate}
        />
      </div>
    </div>
  );
};
