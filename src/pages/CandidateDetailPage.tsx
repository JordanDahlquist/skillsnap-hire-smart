
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useOptimizedJob } from "@/hooks/useOptimizedJobs";
import { useOptimizedApplications } from "@/hooks/useOptimizedApplications";
import { useRotatingBackground } from "@/hooks/useRotatingBackground";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { CandidateDetailHeader } from "@/components/candidate-detail/CandidateDetailHeader";
import { CandidateDetailContent } from "@/components/candidate-detail/CandidateDetailContent";
import { CandidateNavigation } from "@/components/candidate-detail/CandidateNavigation";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Footer } from "@/components/Footer";
import { logger } from "@/services/loggerService";
import { Application } from "@/types";

export const CandidateDetailPage = () => {
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useOptimizedAuth();
  const { currentImage, nextImage, isTransitioning, showSecondary } = useRotatingBackground();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const {
    data: job,
    isLoading: jobLoading,
    error: jobError
  } = useOptimizedJob(jobId);
  
  const {
    data: applications = [],
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications
  } = useOptimizedApplications(jobId);

  const isLoading = jobLoading || applicationsLoading;

  // Find the current application and set it
  useEffect(() => {
    if (applications.length > 0 && applicationId) {
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        setSelectedApplication(application);
        logger.debug('Found application for candidate detail page', { applicationId });
      } else {
        logger.warn('Application not found', { applicationId, availableIds: applications.map(app => app.id) });
        // Redirect back to dashboard if application not found
        navigate(`/dashboard/${jobId}`);
      }
    }
  }, [applications, applicationId, navigate, jobId]);

  const handleApplicationUpdate = () => {
    refetchApplications();
  };

  const handleNavigateToCandidate = (newApplicationId: string) => {
    navigate(`/dashboard/${jobId}/candidate/${newApplicationId}`);
  };

  const handleBackToDashboard = () => {
    navigate(`/dashboard/${jobId}`);
  };

  // Generate CSS class names for crossfade background
  const backgroundClass = `candidate-detail-crossfade-background ${
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
          {`.candidate-detail-crossfade-background::before { background-image: var(--bg-primary); }`}
          {`.candidate-detail-crossfade-background::after { background-image: var(--bg-secondary); }`}
        </style>

        {/* Ambient Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/5 to-pink-300/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (jobError || applicationsError || !job || !selectedApplication) {
    return (
      <div
        className={`${backgroundClass} flex items-center justify-center`}
        style={{
          '--bg-primary': `url(${currentImage})`,
          '--bg-secondary': `url(${nextImage})`
        } as React.CSSProperties & { '--bg-primary': string; '--bg-secondary': string }}
      >
        <style>
          {`.candidate-detail-crossfade-background::before { background-image: var(--bg-primary); }`}
          {`.candidate-detail-crossfade-background::after { background-image: var(--bg-secondary); }`}
        </style>

        <div className="relative z-10 text-center glass-card p-8 mx-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {!job ? 'Job Not Found' : 'Candidate Not Found'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {!job 
              ? "The job you're looking for doesn't exist or you don't have access to it."
              : "The candidate you're looking for doesn't exist or has been removed."
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
        {`.candidate-detail-crossfade-background::before { background-image: var(--bg-primary); }`}
        {`.candidate-detail-crossfade-background::after { background-image: var(--bg-secondary); }`}
      </style>

      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/5 to-pink-300/5 rounded-full blur-3xl"></div>
      </div>

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
