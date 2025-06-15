
import { useParams, useNavigate } from "react-router-dom";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useOptimizedJob } from "@/hooks/useOptimizedJobs";
import { useOptimizedApplications } from "@/hooks/useOptimizedApplications";
import { useApplication } from "@/hooks/useApplication";
import { useRotatingBackground } from "@/hooks/useRotatingBackground";
import { useThemeContext } from "@/contexts/ThemeContext";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { CandidateDetailHeader } from "@/components/candidate-detail/CandidateDetailHeader";
import { CandidateDetailContent } from "@/components/candidate-detail/CandidateDetailContent";
import { CandidateNavigation } from "@/components/candidate-detail/CandidateNavigation";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Footer } from "@/components/Footer";
import { logger } from "@/services/loggerService";

export const CandidateDetailPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();
  const { currentImage, nextImage, isTransitioning, showSecondary } = useRotatingBackground();
  const { currentTheme } = useThemeContext();

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
    navigate(`/candidate/${newApplicationId}`);
  };

  const handleBackToDashboard = () => {
    if (jobId) {
      navigate(`/jobs/${jobId}`);
    } else {
      navigate('/jobs');
    }
  };

  // Check if this is a solid color theme
  const isSolidColorTheme = currentTheme === 'white' || currentTheme === 'black';

  if (isSolidColorTheme) {
    // For solid color themes, just use a simple background
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
          <div className="relative z-10 text-center glass-card p-8 mx-4">
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
            />
          </div>

          <Footer />
        </div>
      </div>
    );
  }

  // Generate CSS class names for crossfade background
  const backgroundClass = `dashboard-crossfade-background ${
    isTransitioning ? 'transitioning' : ''
  } ${showSecondary ? 'show-secondary' : ''}`;

  if (isLoading) {
    return (
      <div
        className={backgroundClass}
        style={{
          '--bg-primary': `url(${currentImage})`,
          '--bg-secondary': `url(${nextImage})`
        } as React.CSSProperties & { '--bg-primary': string; '--bg-secondary': string }}
      >
        <style>
          {`.dashboard-crossfade-background::before { background-image: var(--bg-primary); }`}
          {`.dashboard-crossfade-background::after { background-image: var(--bg-secondary); }`}
        </style>

        {/* Ambient Background Effects - Only show in light mode */}
        {currentTheme === 'light' && (
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/5 to-pink-300/5 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Dark mode overlay - Only show in dark mode */}
        {currentTheme === 'dark' && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
          </div>
        )}

        <div className="relative z-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (applicationError || jobError || !selectedApplication || !job) {
    return (
      <div
        className={`${backgroundClass} flex items-center justify-center`}
        style={{
          '--bg-primary': `url(${currentImage})`,
          '--bg-secondary': `url(${nextImage})`
        } as React.CSSProperties & { '--bg-primary': string; '--bg-secondary': string }}
      >
        <style>
          {`.dashboard-crossfade-background::before { background-image: var(--bg-primary); }`}
          {`.dashboard-crossfade-background::after { background-image: var(--bg-secondary); }`}
        </style>

        {/* Ambient Background Effects - Only show in light mode */}
        {currentTheme === 'light' && (
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/5 to-pink-300/5 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Dark mode overlay - Only show in dark mode */}
        {currentTheme === 'dark' && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
          </div>
        )}

        <div className="relative z-10 text-center glass-card p-8 mx-4">
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
    <div
      className={`${backgroundClass} flex flex-col min-h-screen`}
      style={{
        '--bg-primary': `url(${currentImage})`,
        '--bg-secondary': `url(${nextImage})`
      } as React.CSSProperties & { '--bg-primary': string; '--bg-secondary': string }}
    >
      <style>
        {`.dashboard-crossfade-background::before { background-image: var(--bg-primary); }`}
        {`.dashboard-crossfade-background::after { background-image: var(--bg-secondary); }`}
      </style>

      {/* Ambient Background Effects - Only show in light mode */}
      {currentTheme === 'light' && (
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/5 to-pink-300/5 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Dark mode overlay - Only show in dark mode */}
      {currentTheme === 'dark' && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        </div>
      )}

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
          />
        </div>

        <Footer />
      </div>
    </div>
  );
};
