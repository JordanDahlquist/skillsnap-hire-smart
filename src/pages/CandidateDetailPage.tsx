
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useOptimizedJob } from "@/hooks/useOptimizedJobs";
import { useOptimizedApplications } from "@/hooks/useOptimizedApplications";
import { useApplication } from "@/hooks/useApplication";
import { useThemeContext } from "@/contexts/ThemeContext";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { CandidateDetailHeader } from "@/components/candidate-detail/CandidateDetailHeader";
import { CandidateDetailContent } from "@/components/candidate-detail/CandidateDetailContent";
import { CandidateNavigation } from "@/components/candidate-detail/CandidateNavigation";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Footer } from "@/components/Footer";

export const CandidateDetailPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();
  const { currentTheme } = useThemeContext();

  // Get the tab parameter from URL
  const initialTab = searchParams.get('tab') || 'overview';

  // First, get the specific application
  const {
    data: selectedApplication,
    isLoading: applicationLoading,
    error: applicationError
  } = useApplication(applicationId);

  // Extract jobId from the application
  const jobId = selectedApplication?.job_id || null;

  // Get the job details once we have the jobId
  const {
    data: job,
    isLoading: jobLoading,
    error: jobError
  } = useOptimizedJob(jobId);

  // Get all applications for this job for navigation
  const {
    data: applications = [],
    refetch: refetchApplications
  } = useOptimizedApplications(jobId);

  const isLoading = applicationLoading || jobLoading;

  const handleApplicationUpdate = () => {
    refetchApplications();
  };

  const handleNavigateToCandidate = (newApplicationId: string) => {
    if (jobId) {
      // Preserve the current tab when navigating
      const currentTab = searchParams.get('tab');
      const tabParam = currentTab ? `?tab=${currentTab}` : '';
      navigate(`/jobs/${jobId}/candidate/${newApplicationId}${tabParam}`);
    }
  };

  const handleBackToDashboard = () => {
    if (jobId) {
      navigate(`/jobs/${jobId}`);
    } else {
      navigate('/jobs');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative z-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (applicationError || jobError || !selectedApplication || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative z-10 text-center bg-card border border-border rounded-lg p-8 mx-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {!selectedApplication ? 'Candidate Not Found' : 'Job Not Found'}
          </h1>
          <p className="text-muted-foreground mb-4 text-left">
            {!selectedApplication 
              ? "The candidate you're looking for doesn't exist or has been removed."
              : "The job associated with this candidate doesn't exist or you don't have access to it."
            }
          </p>
          <button 
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative z-10 flex flex-col flex-1">
        <UnifiedHeader showCreateButton={false} />
        
        <CandidateDetailHeader 
          job={job}
          application={selectedApplication}
          onBackToDashboard={handleBackToDashboard}
          onApplicationUpdate={handleApplicationUpdate}
        />

        <CandidateNavigation 
          applications={applications}
          currentApplication={selectedApplication}
          onNavigateToCandidate={handleNavigateToCandidate}
        />

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <CandidateDetailContent 
            application={selectedApplication}
            job={job}
            onApplicationUpdate={handleApplicationUpdate}
            initialTab={initialTab}
          />
        </div>

        <Footer />
      </div>
    </div>
  );
};
