
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StageSelector } from "../StageSelector";
import { ApplicationRatingSection } from "./ApplicationRatingSection";
import { ApplicationActionButtons } from "./ApplicationActionButtons";
import { getTimeAgo } from "@/utils/dateUtils";
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
  onStageChange: (applicationId: string, newStage: string) => void;
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
  const displayStatus = application.status === "reviewed" && !application.manual_rating ? "pending" : application.status;
  const pipelineStage = application.pipeline_stage || 'applied';

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header Section */}
      <div className="border-b border-border pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{application.name}</h2>
            <p className="text-muted-foreground">{application.email}</p>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(displayStatus)}>
              {displayStatus}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Applied {getTimeAgo(application.created_at)}
            </p>
          </div>
        </div>

        {/* Stage Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Stage:</span>
          <StageSelector
            jobId={jobId}
            currentStage={pipelineStage}
            applicationId={application.id}
            onStageChange={onStageChange}
          />
        </div>
      </div>

      {/* Rating Section */}
      <ApplicationRatingSection
        manualRating={application.manual_rating}
        aiRating={application.ai_rating}
        onManualRating={onManualRating}
        isUpdating={isUpdating}
      />

      {/* Contact Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-foreground">{application.email}</p>
          </div>
          {application.phone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-foreground">{application.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter */}
      {application.cover_letter && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Cover Letter</h3>
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-foreground whitespace-pre-wrap">{application.cover_letter}</p>
          </div>
        </div>
      )}

      {/* AI Summary */}
      {application.ai_summary && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">AI Summary</h3>
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-foreground">{application.ai_summary}</p>
          </div>
        </div>
      )}

      {/* Resume Link */}
      {application.resume_file_path && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Resume</h3>
          <Button 
            variant="outline" 
            asChild 
            className="w-full"
          >
            <a 
              href={application.resume_file_path} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center"
            >
              View Resume
            </a>
          </Button>
        </div>
      )}

      {/* Rejection Reason */}
      {application.status === 'rejected' && application.rejection_reason && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Rejection Reason</h3>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-foreground">{application.rejection_reason}</p>
          </div>
        </div>
      )}

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
  );
};
