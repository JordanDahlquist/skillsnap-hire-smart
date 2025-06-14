
import { useState } from "react";
import { ChevronLeft, Star, ThumbsDown, RotateCcw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { renderAIRating } from "@/components/dashboard/utils/ratingUtils";
import { StageSelector } from "@/components/dashboard/StageSelector";
import { useApplicationActions } from "@/hooks/useApplicationActions";
import { Application, Job } from "@/types";

interface CandidateDetailHeaderProps {
  job: Job;
  application: Application;
  onBackToDashboard: () => void;
  onApplicationUpdate: () => void;
}

export const CandidateDetailHeader = ({ 
  job, 
  application, 
  onBackToDashboard,
  onApplicationUpdate
}: CandidateDetailHeaderProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { 
    updateApplicationRating, 
    rejectApplication, 
    unrejectApplication 
  } = useApplicationActions(onApplicationUpdate);

  const getStatusColor = (status: string, manualRating?: number | null) => {
    if (status === "reviewed" && !manualRating) {
      return "bg-yellow-100 text-yellow-800";
    }
    
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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

  const displayStatus = application.status === "reviewed" && !application.manual_rating ? "pending" : application.status;

  return (
    <div className="border-b border-border/20 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onBackToDashboard}
                className="cursor-pointer hover:text-primary"
              >
                {job.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {application.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Header Content */}
        <div className="flex items-start justify-between gap-8">
          {/* Left Side - Candidate Info */}
          <div className="flex items-start gap-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="mt-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {application.name}
                </h1>
                <Badge className={getStatusColor(application.status, application.manual_rating)}>
                  {displayStatus}
                </Badge>
                {application.pipeline_stage && (
                  <Badge variant="outline">
                    {application.pipeline_stage}
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-3">
                {application.email}
              </p>
              
              {/* AI Rating (Read-only) */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">AI Rating:</span>
                <div className="flex gap-0.5">
                  {renderAIRating(application.ai_rating)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Integrated Controls */}
          <div className="flex flex-col gap-4 min-w-[320px]">
            {/* Rating Section */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating)}
                    disabled={isUpdating}
                    className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
                  >
                    <Star 
                      className={`w-5 h-5 ${
                        (application.manual_rating || 0) >= rating 
                          ? "text-blue-500 fill-current" 
                          : "text-gray-300"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Stage:</span>
              <div className="flex-1 max-w-[180px]">
                <StageSelector
                  jobId={job.id}
                  currentStage={application.pipeline_stage || 'applied'}
                  applicationId={application.id}
                  size="sm"
                />
              </div>
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
                  <RotateCcw className="w-4 h-4 mr-1.5" />
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
          </div>
        </div>
      </div>
    </div>
  );
};
