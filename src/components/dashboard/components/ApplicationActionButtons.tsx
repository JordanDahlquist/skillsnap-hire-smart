
import { Button } from "@/components/ui/button";
import { ThumbsDown, RotateCcw, Mail } from "lucide-react";
import { StageSelector } from "../StageSelector";

interface ApplicationActionButtonsProps {
  status: string;
  isUpdating: boolean;
  onReject: () => void;
  onUnreject: () => void;
  onEmail: () => void;
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
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
      <div className="flex gap-2">
        {status === 'rejected' ? (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onUnreject}
            disabled={isUpdating}
            className="border-green-200 text-green-600 hover:bg-green-50 flex-1 sm:flex-none"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Unreject</span>
            <span className="xs:hidden">Undo</span>
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onReject}
            disabled={isUpdating}
            className="border-red-200 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            Reject
          </Button>
        )}
        <Button 
          size="sm" 
          onClick={onEmail}
          className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
      </div>
      <div className="w-full sm:w-auto">
        <StageSelector
          jobId={jobId}
          currentStage={currentStage}
          applicationId={applicationId}
          onStageChange={onStageChange}
          size="sm"
        />
      </div>
    </div>
  );
};
