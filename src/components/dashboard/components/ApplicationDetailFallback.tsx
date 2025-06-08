
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Users, ExternalLink } from "lucide-react";

interface ApplicationDetailFallbackProps {
  hasApplications: boolean;
  jobId: string;
}

export const ApplicationDetailFallback = ({ hasApplications, jobId }: ApplicationDetailFallbackProps) => {
  if (hasApplications) {
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
          <a href={`/apply/${jobId}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Job Application Page
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
