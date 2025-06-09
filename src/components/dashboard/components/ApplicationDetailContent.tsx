
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
      <CardHeader className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header Info - Always stacked for better space management */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <CardTitle className="text-lg sm:text-xl truncate flex-1 min-w-0">{application.name}</CardTitle>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm sm:text-base truncate">{application.email}</p>
          </div>
          
          {/* Rating Section - Full width, compact */}
          <ApplicationRatingSection
            manualRating={application.manual_rating}
            aiRating={application.ai_rating}
            onManualRating={onManualRating}
            isUpdating={isUpdating}
          />
          
          {/* Action Buttons */}
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
