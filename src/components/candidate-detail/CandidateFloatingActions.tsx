
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ThumbsDown, RotateCcw, Mail } from "lucide-react";
import { StageSelector } from "@/components/dashboard/StageSelector";
import { useApplicationActions } from "@/hooks/useApplicationActions";
import { Application, Job } from "@/types";

interface CandidateFloatingActionsProps {
  application: Application;
  job: Job;
  onApplicationUpdate: () => void;
}

export const CandidateFloatingActions = ({ 
  application, 
  job, 
  onApplicationUpdate 
}: CandidateFloatingActionsProps) => {
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
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="glass-card p-4 shadow-lg border border-border/50">
        <div className="space-y-3">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Rate:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  disabled={isUpdating}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <Star 
                    className={`w-4 h-4 ${
                      (application.manual_rating || 0) >= rating 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-300"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Stage Selector */}
          <div className="min-w-0">
            <StageSelector
              jobId={job.id}
              currentStage={application.pipeline_stage || 'applied'}
              applicationId={application.id}
              size="sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {application.status === 'rejected' ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleUnreject}
                disabled={isUpdating}
                className="border-green-200 text-green-600 hover:bg-green-50 flex-1"
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
                className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                Reject
              </Button>
            )}
            
            <Button 
              size="sm" 
              onClick={handleEmail}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
