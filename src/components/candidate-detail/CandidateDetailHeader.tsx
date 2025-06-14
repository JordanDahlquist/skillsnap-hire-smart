
import { ChevronLeft } from "lucide-react";
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
import { renderManualRating, renderAIRating } from "@/components/dashboard/utils/ratingUtils";
import { Application, Job } from "@/types";

interface CandidateDetailHeaderProps {
  job: Job;
  application: Application;
  onBackToDashboard: () => void;
}

export const CandidateDetailHeader = ({ 
  job, 
  application, 
  onBackToDashboard 
}: CandidateDetailHeaderProps) => {
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
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="mt-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div>
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
              
              {/* Ratings */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Your Rating:</span>
                  <div className="flex gap-0.5">
                    {renderManualRating(application.manual_rating)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">AI Rating:</span>
                  <div className="flex gap-0.5">
                    {renderAIRating(application.ai_rating)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
