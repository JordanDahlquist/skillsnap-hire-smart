
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
import { EmailComposerModal } from "@/components/dashboard/EmailComposerModal";
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
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  
  const { 
    updateApplicationRating, 
    rejectApplication, 
    unrejectApplication 
  } = useApplicationActions(onApplicationUpdate);

  const getStatusColor = (status: string) => {
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
    setShowEmailComposer(true);
  };

  return (
    <>
      <div className="border-b border-border/20 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Compact Navigation */}
          <div className="py-2 flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={onBackToDashboard}
                    className="cursor-pointer hover:text-primary text-xs text-left"
                  >
                    {job.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs text-left">
                    {application.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="flex items-center gap-1 text-xs h-7 px-2"
            >
              <ChevronLeft className="w-3 h-3" />
              Back
            </Button>
          </div>

          {/* Main Compact Header Row */}
          <div className="py-3 flex items-center justify-between gap-6">
            
            {/* Left: Candidate Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-foreground text-left truncate">
                    {application.name}
                  </h1>
                  <p className="text-xs text-muted-foreground text-left truncate">
                    {application.email}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge className={`${getStatusColor(application.status)} text-xs px-2 py-0.5`}>
                    {application.status}
                  </Badge>
                  {application.pipeline_stage && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {application.pipeline_stage}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Ratings */}
            <div className="flex items-center gap-6 flex-shrink-0">
              
              {/* AI Rating */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">AI</span>
                <div className="flex gap-0.5">
                  {renderAIRating(application.ai_rating)}
                </div>
                <span className="text-xs text-purple-600 font-medium w-8">
                  {application.ai_rating ? `${Math.round(application.ai_rating)}/3` : '--'}
                </span>
              </div>

              {/* Manual Rating */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Rating</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      disabled={isUpdating}
                      className="hover:scale-110 transition-transform disabled:opacity-50"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          (application.manual_rating || 0) >= rating 
                            ? "text-blue-500 fill-current" 
                            : "text-gray-300 hover:text-blue-400"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs text-blue-600 font-medium w-8">
                  {application.manual_rating ? `${application.manual_rating}/3` : '--'}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <StageSelector
                jobId={job.id}
                currentStage={application.pipeline_stage || 'applied'}
                applicationId={application.id}
                size="sm"
              />
              
              <Button 
                onClick={handleEmail}
                size="sm"
                variant="default"
                disabled={isUpdating}
                className="h-8 px-3 text-xs"
              >
                <Mail className="w-3 h-3 mr-1" />
                Email
              </Button>
              
              {application.status === 'rejected' ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleUnreject}
                  disabled={isUpdating}
                  className="border-green-200 text-green-600 hover:bg-green-50 h-8 px-3 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Unreject
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  disabled={isUpdating}
                  className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 text-xs"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isUpdating && (
            <div className="pb-2">
              <span className="text-xs text-muted-foreground">Updating...</span>
            </div>
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      <EmailComposerModal
        open={showEmailComposer}
        onOpenChange={setShowEmailComposer}
        selectedApplications={[application]}
        job={job}
      />
    </>
  );
};
