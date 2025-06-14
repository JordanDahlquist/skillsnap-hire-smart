
import { useState } from "react";
import { ChevronLeft, Star, ThumbsDown, RotateCcw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    console.log("Open email composer for", application.email);
  };

  const displayStatus = application.status === "reviewed" && !application.manual_rating ? "pending" : application.status;

  return (
    <div className="border-b border-border/20 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Section */}
        <div className="py-4 border-b border-border/10">
          <div className="flex items-center justify-between">
            <Breadcrumb>
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Main Information Section - Three Columns */}
        <div className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Candidate Profile Column */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {application.name}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      {application.email}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(application.status, application.manual_rating)}>
                      {displayStatus}
                    </Badge>
                    {application.pipeline_stage && (
                      <Badge variant="outline">
                        {application.pipeline_stage}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ratings Column */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* AI Rating Display */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      AI Assessment
                    </div>
                    <div className="flex justify-center gap-1 mb-1">
                      {renderAIRating(application.ai_rating)}
                    </div>
                    <div className="text-xs text-purple-600 font-medium">
                      {application.ai_rating ? `${Math.round(application.ai_rating)}/3` : 'Not assessed'}
                    </div>
                  </div>

                  {/* Manual Rating Controls */}
                  <div className="text-center border-t border-border pt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-3">
                      Your Rating
                    </div>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRating(rating)}
                          disabled={isUpdating}
                          className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 group"
                        >
                          <Star 
                            className={`w-6 h-6 transition-all duration-200 group-hover:scale-110 ${
                              (application.manual_rating || 0) >= rating 
                                ? "text-blue-500 fill-current" 
                                : "text-gray-300 group-hover:text-blue-400"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      {application.manual_rating ? `${application.manual_rating}/3` : 'Click to rate'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Stage Column */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Pipeline Stage */}
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-3">
                      Pipeline Stage
                    </div>
                    <StageSelector
                      jobId={job.id}
                      currentStage={application.pipeline_stage || 'applied'}
                      applicationId={application.id}
                      size="sm"
                    />
                  </div>

                  {/* Status Info */}
                  <div className="border-t border-border pt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Application Status
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(application.status, application.manual_rating)}>
                        {displayStatus}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Last updated: {new Date(application.updated_at || application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Bar Section */}
        <div className="pb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center">
                {/* Primary Action - Email */}
                <Button 
                  onClick={handleEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 flex-1 sm:flex-none"
                  disabled={isUpdating}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Candidate
                </Button>
                
                {/* Secondary Actions */}
                <div className="flex gap-3 flex-1 sm:flex-none">
                  {application.status === 'rejected' ? (
                    <Button 
                      variant="outline"
                      onClick={handleUnreject}
                      disabled={isUpdating}
                      className="border-green-200 text-green-600 hover:bg-green-50 flex-1 sm:flex-none"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Unreject
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={handleReject}
                      disabled={isUpdating}
                      className="border-red-200 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
              
              {isUpdating && (
                <div className="text-center mt-3">
                  <span className="text-xs text-muted-foreground">Updating...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
