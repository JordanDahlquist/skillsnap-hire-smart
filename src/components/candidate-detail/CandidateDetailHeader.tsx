
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

  const hasManualRating = application.manual_rating && application.manual_rating > 0;

  return (
    <>
      <div className="border-b border-border/20 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Navigation Section */}
          <div className="py-3 border-b border-border/10">
            <div className="flex items-center justify-between">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={onBackToDashboard}
                      className="cursor-pointer hover:text-primary text-sm text-left"
                    >
                      {job.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm text-left">
                      {application.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </Button>
            </div>
          </div>

          {/* Candidate Information Row */}
          <div className="py-4 border-b border-border/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Left: Candidate Details */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground text-left mb-1">
                  {application.name}
                </h1>
                <p className="text-sm text-muted-foreground text-left mb-2">
                  {application.email}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getStatusColor(application.status)} text-xs px-2 py-1`}>
                    {application.status}
                  </Badge>
                  {application.pipeline_stage && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {application.pipeline_stage}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right: Stage Selector */}
              <div className="flex items-center gap-2 lg:flex-shrink-0">
                <span className="text-sm font-medium text-muted-foreground text-left">Stage:</span>
                <StageSelector
                  jobId={job.id}
                  currentStage={application.pipeline_stage || 'applied'}
                  applicationId={application.id}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Ratings and Actions Row */}
          <div className="py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              
              {/* AI Rating */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground text-left">AI Rating:</span>
                <div className="flex gap-1">
                  {renderAIRating(application.ai_rating)}
                </div>
                <span className="text-sm text-purple-600 font-medium">
                  {application.ai_rating ? `${Math.round(application.ai_rating)}/3` : 'N/A'}
                </span>
              </div>

              {/* Manual Rating */}
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                !hasManualRating ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}>
                <span className={`text-sm font-medium text-left ${
                  !hasManualRating ? 'text-blue-700' : 'text-muted-foreground'
                }`}>
                  {!hasManualRating ? 'Rate this candidate:' : 'Your Rating:'}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      disabled={isUpdating}
                      className="hover:scale-110 transition-transform disabled:opacity-50"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          (application.manual_rating || 0) >= rating 
                            ? "text-blue-500 fill-current" 
                            : !hasManualRating
                              ? "text-blue-300 hover:text-blue-500"
                              : "text-gray-300 hover:text-blue-400"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className={`text-sm font-medium ${
                  !hasManualRating ? 'text-blue-700' : 'text-blue-600'
                }`}>
                  {application.manual_rating ? `${application.manual_rating}/3` : '--'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 lg:justify-end">
                <Button 
                  onClick={handleEmail}
                  size="sm"
                  variant="default"
                  disabled={isUpdating}
                  className="flex-1 lg:flex-initial"
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
                    className="border-green-200 text-green-600 hover:bg-green-50 flex-1 lg:flex-initial"
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
                    className="border-red-200 text-red-600 hover:bg-red-50 flex-1 lg:flex-initial"
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                )}
              </div>
            </div>

            {isUpdating && (
              <div className="text-center mt-2">
                <span className="text-xs text-muted-foreground">Updating...</span>
              </div>
            )}
          </div>
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
