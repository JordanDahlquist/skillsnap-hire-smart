
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsDown, RotateCcw, Mail, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { StageSelector } from "@/components/dashboard/StageSelector";
import { useApplicationActions } from "@/hooks/useApplicationActions";
import { renderManualRating, renderAIRating } from "@/components/dashboard/utils/ratingUtils";
import { getTimeAgo } from "@/utils/dateUtils";
import { Application, Job } from "@/types";
import { useState } from "react";

interface CandidateOverviewTabProps {
  application: Application;
  job: Job;
  onApplicationUpdate: () => void;
}

export const CandidateOverviewTab = ({ 
  application, 
  job, 
  onApplicationUpdate 
}: CandidateOverviewTabProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { 
    updateApplicationRating, 
    rejectApplication, 
    unrejectApplication 
  } = useApplicationActions(onApplicationUpdate);

  const handleRating = async (rating: number) => {
    setIsUpdating(true);
    await updateApplicationRating(application.id, rating);
    setIsUpdating(false);
  };

  const handleReject = async () => {
    setIsUpdating(true);
    await rejectApplication(application.id, "Rejected from candidate detail page");
    setIsUpdating(false);
  };

  const handleUnreject = async () => {
    setIsUpdating(true);
    await unrejectApplication(application.id);
    setIsUpdating(false);
  };

  const handleEmail = () => {
    // Open email composer - could be implemented as a modal
    console.log("Open email composer for", application.email);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating)}
                    disabled={isUpdating}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <Star 
                      className={`w-5 h-5 ${
                        (application.manual_rating || 0) >= rating 
                          ? "text-yellow-400 fill-current" 
                          : "text-gray-300"
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-0.5 ml-4">
                {renderManualRating(application.manual_rating)}
              </div>
            </div>

            {/* Stage Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Stage:</span>
              <div className="flex-1">
                <StageSelector
                  jobId={job.id}
                  currentStage={application.pipeline_stage || 'applied'}
                  applicationId={application.id}
                  size="sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {application.status === 'rejected' ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleUnreject}
                  disabled={isUpdating}
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Unreject
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleReject}
                  disabled={isUpdating}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              )}
              
              <Button 
                size="sm" 
                onClick={handleEmail}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">{application.location}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Online Presence */}
      {(application.portfolio_url || application.linkedin_url || application.github_url) && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Online Presence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.portfolio_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Portfolio</label>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={application.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Portfolio
                    </a>
                  </div>
                </div>
              )}
              {application.linkedin_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                  <div className="flex items-center gap-1">
                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={application.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              )}
              {application.github_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">GitHub</label>
                  <div className="flex items-center gap-1">
                    <Github className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={application.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Details */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Applied</label>
              <p className="text-foreground">{getTimeAgo(application.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">AI Rating</label>
              <div className="flex gap-0.5">
                {renderAIRating(application.ai_rating)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {application.ai_summary && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-foreground">{application.ai_summary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cover Letter */}
      {application.cover_letter && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border border-border max-h-96 overflow-y-auto">
              <p className="text-foreground whitespace-pre-wrap">{application.cover_letter}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason */}
      {application.status === 'rejected' && application.rejection_reason && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Rejection Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-foreground">{application.rejection_reason}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
