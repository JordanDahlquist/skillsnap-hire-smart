
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationTabs } from "../ApplicationTabs";
import { ApplicationRatingSection } from "./ApplicationRatingSection";
import { ApplicationActionButtons } from "./ApplicationActionButtons";

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
  pipeline_stage: string | null;
}

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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle>{application.name}</CardTitle>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">{application.email}</p>
            
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
          
          <ApplicationRatingSection
            manualRating={application.manual_rating}
            aiRating={application.ai_rating}
            onManualRating={onManualRating}
            isUpdating={isUpdating}
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
