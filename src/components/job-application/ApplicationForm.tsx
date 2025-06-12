
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, FileX, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { MultiStepApplicationForm } from "./MultiStepApplicationForm";
import { Job } from "@/types";

interface ApplicationFormProps {
  jobId: string;
  isApplicationOpen: boolean;
  jobStatus: string;
  job: Job;
}

export const ApplicationForm = ({ jobId, isApplicationOpen, jobStatus, job }: ApplicationFormProps) => {
  const getStatusMessage = () => {
    switch (jobStatus) {
      case 'draft':
        return {
          icon: <FileX className="w-5 h-5 text-gray-500" />,
          title: "Position Not Yet Published",
          description: "This position is still in draft mode and is not yet accepting applications. Please check back later when it becomes available.",
          variant: "default" as const
        };
      case 'paused':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          title: "Applications Temporarily Paused",
          description: "Applications for this position are currently paused. The employer may resume accepting applications soon. Please check back later.",
          variant: "default" as const
        };
      case 'closed':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          title: "Applications Closed",
          description: "This position is no longer accepting new applications. The application period has ended or the position has been filled.",
          variant: "destructive" as const
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  if (!isApplicationOpen) {
    return (
      <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg glass-card-no-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {statusMessage?.icon}
            {statusMessage?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={statusMessage?.variant}>
            <AlertDescription>
              {statusMessage?.description}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" asChild className="flex-1">
              <Link to="/jobs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Other Positions
              </Link>
            </Button>
            
            {jobStatus === 'paused' && (
              <Button variant="outline" className="flex-1" disabled>
                <Clock className="w-4 h-4 mr-2" />
                Get Notified When Open
              </Button>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Job Status: 
              <Badge className="ml-2" variant={jobStatus === 'closed' ? 'destructive' : 'secondary'}>
                {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
              </Badge>
            </p>
            <p className="text-xs text-gray-500">
              Even though applications are not currently being accepted, you can still view the full job details above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <MultiStepApplicationForm 
      job={job}
      jobId={jobId}
      isApplicationOpen={isApplicationOpen}
      jobStatus={jobStatus}
    />
  );
};
