
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Job {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

interface DashboardHeaderProps {
  job: Job;
  getTimeAgo: (dateString: string) => string;
}

export const DashboardHeader = ({ job, getTimeAgo }: DashboardHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600">Job posted {getTimeAgo(job.created_at)}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Page
              </a>
            </Button>
            <Badge className={job.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {job.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
