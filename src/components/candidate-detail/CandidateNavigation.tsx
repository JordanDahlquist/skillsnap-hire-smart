
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Application } from "@/types";

interface CandidateNavigationProps {
  applications: Application[];
  currentApplication: Application;
  onNavigateToCandidate: (applicationId: string) => void;
}

export const CandidateNavigation = ({ 
  applications, 
  currentApplication, 
  onNavigateToCandidate 
}: CandidateNavigationProps) => {
  const currentIndex = applications.findIndex(app => app.id === currentApplication.id);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < applications.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onNavigateToCandidate(applications[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onNavigateToCandidate(applications[currentIndex + 1].id);
    }
  };

  if (applications.length <= 1) {
    return null;
  }

  return (
    <div className="border-b border-border/10 bg-background/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Candidate
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} of {applications.length} candidates
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex items-center gap-2"
          >
            Next Candidate
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
