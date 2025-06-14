import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { StageSelector } from "../StageSelector";
import { ApplicationRatingSection } from "./ApplicationRatingSection";
import { ApplicationActionButtons } from "./ApplicationActionButtons";
import { VideoResponsePlayer } from "./VideoResponsePlayer";
import { getTimeAgo } from "@/utils/dateUtils";
import { Application } from "@/types";
import { safeParseSkillsTestResponses, safeParseVideoTranscripts } from "@/utils/typeGuards";

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
  const navigate = useNavigate();
  const displayStatus = application.status === "reviewed" && !application.manual_rating ? "pending" : application.status;
  const pipelineStage = application.pipeline_stage || 'applied';

  // Parse skills test responses safely
  const skillsResponses = safeParseSkillsTestResponses(application.skills_test_responses || []);

  // Parse video transcripts safely
  const skillsTranscripts = safeParseVideoTranscripts(application.skills_video_transcripts || []);
  const interviewTranscripts = safeParseVideoTranscripts(application.interview_video_transcripts || []);

  const handleViewFullProfile = () => {
    navigate(`/dashboard/${jobId}/candidate/${application.id}`);
  };

  // Get transcript processing status display
  const getTranscriptStatusDisplay = () => {
    const status = application.transcript_processing_status;
    const hasVideos = skillsResponses.some((r: any) => r.answerType === 'video') || 
                     application.interview_video_url || 
                     (Array.isArray(application.interview_video_responses) && application.interview_video_responses.length > 0);
    
    if (!hasVideos) return null;

    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Transcripts Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-600">Processing Transcripts...</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600">Transcripts Ready</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600">Transcript Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">Unknown Status</Badge>;
    }
  };

  return (
    <div className="glass-card-no-hover p-6 space-y-6">
      {/* Header Section */}
      <div className="border-b border-border pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Name and Stage Selector in one line */}
            <div className="flex items-center gap-4 mb-2">
              <h2 
                className="text-2xl font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
                onClick={handleViewFullProfile}
              >
                {application.name}
              </h2>
              <StageSelector
                jobId={jobId}
                currentStage={pipelineStage}
                applicationId={application.id}
                onStageChange={onStageChange}
                size="sm"
              />
            </div>
            <p className="text-muted-foreground">{application.email}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <Badge className={getStatusColor(displayStatus)}>
              {displayStatus}
            </Badge>
            {getTranscriptStatusDisplay()}
            <p className="text-xs text-muted-foreground">
              Applied {getTimeAgo(application.created_at)}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewFullProfile}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View Full Profile
            </Button>
          </div>
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
          {application.location && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="text-foreground">{application.location}</p>
            </div>
          )}
          {application.portfolio_url && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Portfolio</label>
              <a 
                href={application.portfolio_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Portfolio
              </a>
            </div>
          )}
          {application.linkedin_url && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
              <a 
                href={application.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Profile
              </a>
            </div>
          )}
          {application.github_url && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">GitHub</label>
              <a 
                href={application.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Profile
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Skills Assessment Responses - Truncated with Transcript Preview */}
      {skillsResponses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Skills Assessment (Preview)</h3>
          <div className="space-y-4">
            {skillsResponses.slice(0, 1).map((response: any, index: number) => (
              <div key={index} className="space-y-2">
                <VideoResponsePlayer
                  response={response}
                  questionIndex={index}
                  transcript={skillsTranscripts.length > index ? skillsTranscripts[index] : undefined}
                />
                {/* Show transcript preview if available */}
                {skillsTranscripts.length > index && skillsTranscripts[index]?.transcript && (
                  <div className="p-3 bg-muted/20 rounded border-l-4 border-blue-500">
                    <h4 className="text-sm font-medium text-foreground mb-1">Video Transcript:</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      "{skillsTranscripts[index].transcript}"
                    </p>
                  </div>
                )}
              </div>
            ))}
            {skillsResponses.length > 1 && (
              <p className="text-sm text-muted-foreground">
                +{skillsResponses.length - 1} more responses. 
                <button
                  onClick={handleViewFullProfile}
                  className="text-blue-600 hover:underline ml-1 cursor-pointer"
                >
                  View full profile to see all.
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cover Letter - Truncated */}
      {application.cover_letter && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Cover Letter (Preview)</h3>
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-foreground line-clamp-3">{application.cover_letter}</p>
            {application.cover_letter.length > 200 && (
              <button
                onClick={handleViewFullProfile}
                className="text-sm text-blue-600 hover:underline mt-2 cursor-pointer"
              >
                View full profile to read complete cover letter.
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Summary with Enhanced Context */}
      {application.ai_summary && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">AI Analysis</h3>
            {(skillsTranscripts.length > 0 || interviewTranscripts.length > 0) && (
              <Badge variant="outline" className="text-green-600">Enhanced with Video Analysis</Badge>
            )}
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-foreground">{application.ai_summary}</p>
            {application.transcript_last_processed_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Analysis includes video transcripts processed {getTimeAgo(application.transcript_last_processed_at)}
              </p>
            )}
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

      {/* Video Interview - Show if exists with Transcript Preview */}
      {application.interview_video_url && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Video Interview (Preview)</h3>
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              src={application.interview_video_url}
              controls
              className="w-full max-h-60 object-contain"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          {/* Show transcript preview if available */}
          {interviewTranscripts.length > 0 && interviewTranscripts[0]?.transcript && (
            <div className="p-3 bg-muted/20 rounded border-l-4 border-green-500">
              <h4 className="text-sm font-medium text-foreground mb-1">Interview Transcript:</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                "{interviewTranscripts[0].transcript}"
              </p>
            </div>
          )}
          <button
            onClick={handleViewFullProfile}
            className="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            View full profile for complete transcript and better video player experience.
          </button>
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
