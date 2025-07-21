import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ThumbsDown, RotateCcw, Mail, FileText, User } from "lucide-react";
import { StageSelector } from "../StageSelector";
import { ApplicationRatingSection } from "./ApplicationRatingSection";
import { VideoResponsePlayer } from "./VideoResponsePlayer";
import { ResumeReprocessor } from "@/components/ResumeReprocessor";
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
    console.log('Navigating to full profile:', `/jobs/${jobId}/candidate/${application.id}`);
    navigate(`/jobs/${jobId}/candidate/${application.id}`);
  };

  const handleViewResume = () => {
    console.log('Navigating to resume tab:', `/jobs/${jobId}/candidate/${application.id}?tab=resume`);
    navigate(`/jobs/${jobId}/candidate/${application.id}?tab=resume`);
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
        return <Badge variant="outline" className="text-yellow-600 text-xs">Transcripts Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-600 text-xs">Processing...</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 text-xs">Transcripts Ready</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 text-xs">Transcript Failed</Badge>;
      default:
        return null;
    }
  };

  // Get unreject preview text
  const getUnrejectPreview = () => {
    const restoreStage = application.previous_pipeline_stage || 'applied';
    const stageDisplayName = restoreStage.charAt(0).toUpperCase() + restoreStage.slice(1).replace('_', ' ');
    return `Unreject (→ ${stageDisplayName})`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Redesigned Sleek Header */}
      <div className="bg-gradient-to-r from-muted/30 to-muted/10 border border-border/30 rounded-xl p-4 -mx-2">
        <div className="space-y-3">
          
          {/* Top: Candidate Name - Full Width */}
          <div className="w-full">
            <h2 className="text-xl font-bold text-foreground mb-1 break-words">
              {application.name}
            </h2>
            <div className="text-sm text-muted-foreground">
              <span className="whitespace-nowrap">Applied {getTimeAgo(application.created_at)}</span>
            </div>
          </div>

          {/* Bottom: Status Badges and Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(displayStatus)}>
                {displayStatus}
              </Badge>
              {getTranscriptStatusDisplay()}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewFullProfile}
                className="h-9 px-3 border-border/50 hover:border-border"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              
              {application.resume_file_path && (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleViewResume}
                  className="h-9 px-3 border-border/50 hover:border-border"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Action Bar */}
      <div className="bg-muted/20 border border-border rounded-lg p-4 -m-2 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            <StageSelector
              jobId={jobId}
              currentStage={pipelineStage}
              applicationId={application.id}
              onStageChange={onStageChange}
              size="sm"
            />
          </div>
          <div className="flex items-center gap-2">
            {application.status === 'rejected' ? (
              <Button 
                variant="outline"
                size="sm"
                onClick={onUnreject}
                disabled={isUpdating}
                className="border-green-200 text-green-600 hover:bg-green-50 h-9 px-4"
                title={`Will restore to ${application.previous_pipeline_stage || 'applied'} stage`}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {getUnrejectPreview()}
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={onReject}
                disabled={isUpdating}
                className="bg-red-600 hover:bg-red-700 text-white h-9 px-4"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Reject
              </Button>
            )}
            <Button 
              size="sm"
              onClick={onEmail}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
      </div>

      {/* Resume Reprocessor - New Section */}
      {application.resume_file_path && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Resume Analysis</h3>
          <ResumeReprocessor 
            application={application} 
            onSuccess={() => {
              // Trigger a refresh of the application data
              window.location.reload();
            }}
          />
        </div>
      )}

      {/* Rating Section */}
      <ApplicationRatingSection
        manualRating={application.manual_rating}
        aiRating={application.ai_rating}
        onManualRating={onManualRating}
        isUpdating={isUpdating}
      />

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
              <label className="text-sm font-medium text-muted-foreground block mb-1">Portfolio</label>
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
              <label className="text-sm font-medium text-muted-foreground block mb-1">LinkedIn</label>
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
              <label className="text-sm font-medium text-muted-foreground block mb-1">GitHub</label>
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
            {application.previous_pipeline_stage && (
              <p className="text-xs text-muted-foreground mt-2">
                Was previously in {application.previous_pipeline_stage} stage
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
