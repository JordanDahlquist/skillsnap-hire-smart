
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationTabs } from "../ApplicationTabs";
import { ApplicationRatingSection } from "./ApplicationRatingSection";
import { ApplicationActionButtons } from "./ApplicationActionButtons";
import { Application } from "@/types";

interface ApplicationDetailContentProps {
  application: Application;
  getStatusColor: (status: string) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
  isUpdating: boolean;
  onManualRating: (rating: number) => void;
  onReject: () => void;
  onUnreject: () => void;
  onEmail: () => void;
  jobId: string;
  onStageChange?: (applicationId: string, newStage: string) => void;
}

export const ApplicationDetailContent = ({
  application,
  getStatusColor,
  getRatingStars,
  getTimeAgo,
  isUpdating,
  onManualRating,
  onReject,
  onUnreject,
  onEmail,
  jobId,
  onStageChange
}: ApplicationDetailContentProps) => {
  // Ensure pipeline_stage defaults to "applied" if null or undefined
  const pipelineStage = application.pipeline_stage || 'applied';

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <CardTitle className="text-lg sm:text-xl truncate">{application.name}</CardTitle>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4 text-sm sm:text-base truncate">{application.email}</p>
            
            <div className="space-y-3 lg:space-y-0">
              <ApplicationActionButtons
                status={application.status}
                isUpdating={isUpdating}
                onReject={onReject}
                onUnreject={onUnreject}
                onEmail={onEmail}
                jobId={jobId}
                applicationId={application.id}
                currentStage={pipelineStage}
                onStageChange={onStageChange}
              />
            </div>
          </div>
          
          <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-sm">
            <ApplicationRatingSection
              manualRating={application.manual_rating}
              aiRating={application.ai_rating}
              onManualRating={onManualRating}
              isUpdating={isUpdating}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ApplicationTabs 
          application={application}
          getStatusColor={getStatusColor}
          getRatingStars={getRatingStars}
          getTimeAgo={getTimeAgo}
        />
      </CardContent>
    </Card>
  );
};
