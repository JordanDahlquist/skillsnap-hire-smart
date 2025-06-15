
import { useMemo } from "react";
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
  // Memoize the navigation data to prevent flickering during updates
  const navigationData = useMemo(() => {
    if (!applications.length || !currentApplication) {
      return {
        currentIndex: -1,
        totalCount: 0,
        hasPrevious: false,
        hasNext: false,
        previousId: null,
        nextId: null
      };
    }

    const currentIndex = applications.findIndex(app => app.id === currentApplication.id);
    
    return {
      currentIndex,
      totalCount: applications.length,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < applications.length - 1,
      previousId: currentIndex > 0 ? applications[currentIndex - 1].id : null,
      nextId: currentIndex < applications.length - 1 ? applications[currentIndex + 1].id : null
    };
  }, [applications, currentApplication.id]);

  const { currentIndex, totalCount, hasPrevious, hasNext, previousId, nextId } = navigationData;

  if (totalCount === 0) return null;

  return (
    <div className="border-b border-border/10 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex items-center justify-between">
          
          {/* Left: Navigation Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => previousId && onNavigateToCandidate(previousId)}
              disabled={!hasPrevious}
              className="h-8 px-3"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => nextId && onNavigateToCandidate(nextId)}
              disabled={!hasNext}
              className="h-8 px-3"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Right: Counter */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{currentIndex + 1}</span> of{" "}
            <span className="font-medium">{totalCount}</span> candidates
          </div>
        </div>
      </div>
    </div>
  );
};
