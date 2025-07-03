
import { Button } from "@/components/ui/button";
import { ThumbsDown, RotateCcw, Mail } from "lucide-react";
import { StageSelector } from "../StageSelector";
import { useEmailNavigation } from "@/hooks/useEmailNavigation";

interface ApplicationActionButtonsProps {
  status: string;
  isUpdating: boolean;
  onReject: () => void;
  onUnreject: () => void;
  onEmail?: () => void;
  jobId: string;
  applicationId: string;
  currentStage: string | null;
  onStageChange?: (applicationId: string, newStage: string) => void;
}

export const ApplicationActionButtons = ({
  status,
  isUpdating,
  onReject,
  onUnreject,
  onEmail,
  jobId,
  applicationId,
  currentStage,
  onStageChange
}: ApplicationActionButtonsProps) => {
  const { navigateToEmailTabFromJob } = useEmailNavigation();

  const handleEmail = () => {
    if (onEmail) {
      onEmail();
    } else {
      // Default behavior: navigate to email tab
      navigateToEmailTabFromJob(jobId, applicationId);
    }
  };

  const handleStageChangeWithLogging = (appId: string, newStage: string) => {
    console.log('Stage change from ApplicationActionButtons:', { appId, newStage });
    onStageChange?.(appId, newStage);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Action Buttons Row */}
      <div className="flex gap-2">
        {status === 'rejected' ? (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onUnreject}
            disabled={isUpdating}
            className="border-green-200 text-green-600 hover:bg-green-50 flex-1"
            title="Move candidate back to pending status and clear rejection"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Unreject
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onReject}
            disabled={isUpdating}
            className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
            title="Reject candidate and move to rejected stage"
          >
            <ThumbsDown className="w-4 h-4 mr-1.5" />
            Reject
          </Button>
        )}
        <Button 
          size="sm" 
          onClick={handleEmail}
          className="bg-blue-600 hover:bg-blue-700 flex-1"
        >
          <Mail className="w-4 h-4 mr-1.5" />
          Email
        </Button>
      </div>
      
      {/* Stage Selector Row */}
      <StageSelector
        jobId={jobId}
        currentStage={currentStage}
        applicationId={applicationId}
        onStageChange={handleStageChangeWithLogging}
        size="sm"
      />
    </div>
  );
};
