import { useState, useEffect } from "react";
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
  
  // Local state for immediate UI updates
  const [localApplication, setLocalApplication] = useState(application);
  
  // Update local state when application prop changes
  useEffect(() => {
    setLocalApplication(application);
  }, [application]);
  
  const { 
    updateApplicationRating, 
    rejectApplication, 
    unrejectApplication 
  } = useApplicationActions(() => {
    onApplicationUpdate();
  });

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
    // Prevent multiple rapid clicks
    if (isUpdating) return;
    
    // Immediate UI update
    setLocalApplication(prev => ({
      ...prev,
      manual_rating: rating,
      status: 'reviewed'
    }));
    
    setIsUpdating(true);
    try {
      await updateApplicationRating(application.id, rating);
    } catch (error) {
      // Revert local state on error
      setLocalApplication(application);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (isUpdating) return;
    
    setLocalApplication(prev => ({
      ...prev,
      status: 'rejected'
    }));
    
    setIsUpdating(true);
    try {
      await rejectApplication(application.id, "Rejected from candidate detail page");
    } catch (error) {
      setLocalApplication(application);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnreject = async () => {
    if (isUpdating) return;
    
    setLocalApplication(prev => ({
      ...prev,
      status: 'pending'
    }));
    
    setIsUpdating(true);
    try {
      await unrejectApplication(application.id);
    } catch (error) {
      setLocalApplication(application);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmail = () => {
    setShowEmailComposer(true);
  };

  return (
    <>
      <div className="border-b border-border/20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <div className="py-2 flex items-center justify-between">
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
                    {localApplication.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="flex items-center gap-1 text-sm h-8 px-3"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Main Header Content */}
          <div className="py-4 flex items-center gap-8">
            
            {/* Left: Candidate Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-foreground text-left truncate mb-1">
                    {localApplication.name}
                  </h1>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm text-muted-foreground text-left truncate">
                      {localApplication.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Ratings Section */}
            <div className="flex items-center gap-8 flex-shrink-0">
              
              {/* Manual Rating */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Your Rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      disabled={isUpdating}
                      className="hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          (localApplication.manual_rating || 0) >= rating 
                            ? "text-blue-500 fill-blue-500" 
                            : "text-gray-300 hover:text-blue-400"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-blue-600 font-medium min-w-[2rem]">
                  {localApplication.manual_rating ? `${localApplication.manual_rating}/3` : '--'}
                </span>
              </div>

              {/* AI Rating */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">AI Rating</span>
                <div className="flex gap-1">
                  {renderAIRating(localApplication.ai_rating)}
                </div>
                <span className="text-sm text-purple-600 font-medium min-w-[2rem]">
                  {localApplication.ai_rating ? `${Math.round(localApplication.ai_rating)}/3` : '--'}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <StageSelector
                jobId={job.id}
                currentStage={localApplication.pipeline_stage || 'applied'}
                applicationId={localApplication.id}
                size="default"
              />
              
              <Button 
                onClick={handleEmail}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                disabled={isUpdating}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              
              {localApplication.status === 'rejected' ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleUnreject}
                  disabled={isUpdating}
                  className="border-green-200 text-green-600 hover:bg-green-50 px-4"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Unreject
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  disabled={isUpdating}
                  className="border-red-200 text-red-600 hover:bg-red-50 px-4"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isUpdating && (
            <div className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">Updating...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      <EmailComposerModal
        open={showEmailComposer}
        onOpenChange={setShowEmailComposer}
        selectedApplications={[localApplication]}
        job={job}
      />
    </>
  );
};
