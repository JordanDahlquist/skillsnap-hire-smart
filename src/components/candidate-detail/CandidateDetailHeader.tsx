
import { useState, useEffect } from "react";
import { ChevronLeft, Star, Mail } from "lucide-react";
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
import { useCandidateInboxData } from "@/hooks/useCandidateInboxData";
import { useEmailNavigation } from "@/hooks/useEmailNavigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Application, Job } from "@/types";

interface CandidateDetailHeaderProps {
  job: Job;
  application: Application;
  onBackToDashboard: () => void;
  onApplicationUpdate: () => void;
  onEmail?: () => void;
  isUpdating?: boolean;
}

export const CandidateDetailHeader = ({ 
  job, 
  application, 
  onBackToDashboard,
  onApplicationUpdate,
  onEmail: propOnEmail,
  isUpdating: propIsUpdating
}: CandidateDetailHeaderProps) => {
  const [isUpdatingRating, setIsUpdatingRating] = useState(false);
  const { navigateToEmailTab } = useEmailNavigation();
  
  const [localApplication, setLocalApplication] = useState(application);
  
  useEffect(() => {
    setLocalApplication(application);
  }, [application]);
  
  const { sendReply } = useCandidateInboxData(application.id);

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
    if (isUpdatingRating || propIsUpdating) return;
    
    // Check if clicking the same rating - if so, deselect it
    const newRating = localApplication.manual_rating === rating ? null : rating;
    
    // Immediate UI update
    setLocalApplication(prev => ({
      ...prev,
      manual_rating: newRating,
      status: newRating === null ? 'pending' : 'reviewed'
    }));
    
    setIsUpdatingRating(true);
    try {
      const updateData = newRating === null 
        ? {
            manual_rating: null,
            status: 'pending',
            updated_at: new Date().toISOString()
          }
        : {
            manual_rating: newRating,
            status: 'reviewed',
            updated_at: new Date().toISOString()
          };

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', application.id);

      if (error) throw error;

      const successMessage = newRating === null 
        ? 'Rating cleared' 
        : `Rating updated to ${newRating} star${newRating !== 1 ? 's' : ''}`;
      
      toast.success(successMessage);
      
      setTimeout(() => {
        onApplicationUpdate();
      }, 100);
      
    } catch (error) {
      console.error('Failed to update rating:', error);
      toast.error('Failed to update rating');
      setLocalApplication(application);
    } finally {
      setIsUpdatingRating(false);
    }
  };

  const handleEmail = () => {
    navigateToEmailTab(localApplication, job.id);
    propOnEmail?.();
  };

  const handleStageChange = (applicationId: string, newStage: string) => {
    console.log('Stage changed in header:', { applicationId, newStage });
    onApplicationUpdate();
  };

  const isAnyUpdating = isUpdatingRating || propIsUpdating;

  return (
    <>
      <div className="border-b border-border/20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="flex items-center gap-1 text-sm h-8 px-3"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
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
            </div>
          </div>

          <div className="py-4 flex items-center gap-8">
            
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

            <div className="flex items-center gap-8 flex-shrink-0">
              
              <div className="flex items-center gap-3 bg-muted/20 px-4 py-3 rounded-lg border border-border/30">
                <span className="text-base font-semibold text-foreground">Your Rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      disabled={isAnyUpdating}
                      className="hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          (localApplication.manual_rating || 0) >= rating 
                            ? "text-blue-500 fill-blue-500" 
                            : "text-gray-300 hover:text-blue-400"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-base text-blue-600 font-semibold min-w-[2.5rem]">
                  {localApplication.manual_rating ? `${localApplication.manual_rating}/3` : '--'}
                </span>
              </div>

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

            <div className="flex items-center gap-3 flex-shrink-0">
              <StageSelector
                jobId={job.id}
                currentStage={localApplication.pipeline_stage || 'applied'}
                applicationId={localApplication.id}
                onStageChange={handleStageChange}
                size="default"
              />
              
              <Button 
                onClick={handleEmail}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-11"
                disabled={isAnyUpdating}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {isAnyUpdating && (
            <div className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">
                  {isUpdatingRating ? 'Updating rating...' : 'Updating...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export { CandidateDetailHeader as default };
