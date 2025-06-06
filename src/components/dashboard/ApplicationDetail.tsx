
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Eye, Users, ExternalLink } from "lucide-react";
import { ApplicationTabs } from "./ApplicationTabs";

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
}

interface Job {
  id: string;
}

interface ApplicationDetailProps {
  selectedApplication: Application | null;
  applications: Application[];
  job: Job;
  getStatusColor: (status: string) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
}

export const ApplicationDetail = ({ 
  selectedApplication, 
  applications, 
  job,
  getStatusColor,
  getRatingStars,
  getTimeAgo 
}: ApplicationDetailProps) => {
  if (selectedApplication) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{selectedApplication.name}</CardTitle>
              <p className="text-gray-600">{selectedApplication.email}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <ThumbsDown className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ApplicationTabs 
            application={selectedApplication}
            getStatusColor={getStatusColor}
            getRatingStars={getRatingStars}
            getTimeAgo={getTimeAgo}
          />
        </CardContent>
      </Card>
    );
  }

  if (applications.length > 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select an application to view details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 text-center text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">No Applications Yet</p>
        <p>Share your job posting link to start receiving applications!</p>
        <Button className="mt-4" variant="outline" asChild>
          <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Job Application Page
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
