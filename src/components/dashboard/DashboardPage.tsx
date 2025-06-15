
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useOptimizedJob } from "@/hooks/useOptimizedJobs";
import { useOptimizedApplications } from "@/hooks/useOptimizedApplications";
import { useRotatingBackground } from "@/hooks/useRotatingBackground";
import { useThemeContext } from "@/contexts/ThemeContext";
import { UnifiedHeader } from "../UnifiedHeader";
import { DashboardHeader } from "./DashboardHeader";
import { ApplicationsManager } from "./ApplicationsManager";
import { EmailComposerModal } from "./EmailComposerModal";
import { JobCreatorPanel } from "../JobCreatorPanel";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { Footer } from "@/components/Footer";
import { logger } from "@/services/loggerService";
import { Application, Job } from "@/types";

export const DashboardPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useOptimizedAuth();
  const { currentImage, nextImage, isTransitioning, showSecondary } = useRotatingBackground();
  const { currentTheme } = useThemeContext();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [createJobOpen, setCreateJobOpen] = useState(false);

  // Parallel loading: Both job and applications load simultaneously
  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
    refetch: refetchJob
  } = useOptimizedJob(jobId);
  const {
    data: applications = [],
    isLoading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications
  } = useOptimizedApplications(jobId);

  // Combined loading state - both queries run in parallel
  const isLoading = jobLoading || applicationsLoading;

  // Check if this is a solid color theme
  const isSolidColorTheme = currentTheme === 'white' || currentTheme === 'black';

  // Handle pre-selected application from URL params or sessionStorage
  useEffect(() => {
    if (applications.length > 0) {
      // First check URL parameters (from Scout candidate cards)
      const selectedAppId = searchParams.get('selectedApp');

      // Then check sessionStorage (backup method)
      const sessionSelectedId = sessionStorage.getItem('selectedApplicationId');
      let targetApplicationId: string | null = null;
      if (selectedAppId) {
        targetApplicationId = selectedAppId;
        logger.debug('Found selected application from URL params', {
          selectedAppId
        });
      } else if (sessionSelectedId) {
        targetApplicationId = sessionSelectedId;
        logger.debug('Found selected application from sessionStorage', {
          sessionSelectedId
        });
        // Clear sessionStorage after using it
        sessionStorage.removeItem('selectedApplicationId');
      }
      if (targetApplicationId) {
        const targetApplication = applications.find(app => app.id === targetApplicationId);
        if (targetApplication) {
          setSelectedApplication(targetApplication);
          logger.debug('Pre-selected application found and set', {
            applicationId: targetApplicationId
          });
          return;
        } else {
          logger.warn('Pre-selected application not found in applications list', {
            targetApplicationId,
            availableIds: applications.map(app => app.id)
          });
        }
      }

      // Default to first application if no pre-selection or pre-selected app not found
      if (!selectedApplication) {
        setSelectedApplication(applications[0]);
        logger.debug('No pre-selection, defaulting to first application', {
          applicationId: applications[0].id
        });
      }
    }
  }, [applications, searchParams, selectedApplication]);

  // Update selected application when applications refetch
  useEffect(() => {
    if (selectedApplication && applications.length > 0) {
      const updatedApplication = applications.find(app => app.id === selectedApplication.id);
      if (updatedApplication) {
        setSelectedApplication(updatedApplication);
      }
    }
  }, [applications, selectedApplication]);

  const handleApplicationUpdate = () => {
    refetchApplications();
  };

  const handleJobUpdate = () => {
    refetchJob();
    refetchApplications();
  };

  const handleCreateJob = () => {
    setCreateJobOpen(true);
  };

  const selectedApplicationsData = applications.filter(app => selectedApplications.includes(app.id));

  // For solid color themes, use simple background
  if (isSolidColorTheme) {
    // Loading state with skeleton - faster loading with parallel queries
    if (isLoading) {
      return (
        <div className="min-h-screen bg-background">
          <DashboardSkeleton />
        </div>
      );
    }

    // Error states
    if (jobError || applicationsError) {
      logger.error('Dashboard errors:', {
        jobError,
        applicationsError
      });
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center glass-card p-8 mx-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Dashboard</h1>
            <p className="text-muted-foreground mb-4">
              {jobError ? 'Failed to load job details.' : 'Failed to load applications.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!job) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center glass-card p-8 mx-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
            <p className="text-muted-foreground">The job you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <UnifiedHeader onCreateRole={handleCreateJob} showCreateButton={true} />
        
        <DashboardHeader job={job} applications={applications} onJobUpdate={handleJobUpdate} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[9px] flex-1">
          <ApplicationsManager 
            applications={applications} 
            selectedApplication={selectedApplication} 
            onSelectApplication={setSelectedApplication} 
            selectedApplications={selectedApplications} 
            onSelectApplications={setSelectedApplications} 
            onSendEmail={() => setEmailModalOpen(true)} 
            onApplicationUpdate={handleApplicationUpdate} 
            job={job} 
          />
        </div>

        <Footer />

        <EmailComposerModal 
          open={emailModalOpen} 
          onOpenChange={setEmailModalOpen} 
          selectedApplications={selectedApplicationsData} 
          job={job} 
        />

        <JobCreatorPanel 
          open={createJobOpen} 
          onOpenChange={setCreateJobOpen} 
        />
      </div>
    );
  }

  // Generate CSS class names for crossfade background (for nature themes)
  const backgroundClass = `dashboard-crossfade-background ${
    isTransitioning ? 'transitioning' : ''
  } ${showSecondary ? 'show-secondary' : ''}`;

  // Loading state with skeleton - faster loading with parallel queries
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
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-300/5 to-cyan-300/5 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Dark mode overlay - Only show in dark mode */}
        {currentTheme === 'dark' && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
          </div>
        )}

        {/* Content Layer */}
        <div className="relative z-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Error states
  if (jobError || applicationsError) {
    logger.error('Dashboard errors:', {
      jobError,
      applicationsError
    });
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
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-300/5 to-cyan-300/5 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Dark mode overlay - Only show in dark mode */}
        {currentTheme === 'dark' && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
          </div>
        )}

        <div className="relative z-10 text-center glass-card p-8 mx-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Dashboard</h1>
          <p className="text-muted-foreground mb-4">
            {jobError ? 'Failed to load job details.' : 'Failed to load applications.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
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
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-300/5 to-cyan-300/5 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Dark mode overlay - Only show in dark mode */}
        {currentTheme === 'dark' && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
          </div>
        )}

        <div className="relative z-10 text-center glass-card p-8 mx-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
          <p className="text-muted-foreground">The job you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${backgroundClass} flex flex-col`}
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
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-300/5 to-cyan-300/5 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Dark mode overlay - Only show in dark mode */}
      {currentTheme === 'dark' && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <UnifiedHeader onCreateRole={handleCreateJob} showCreateButton={true} />
        
        <DashboardHeader job={job} applications={applications} onJobUpdate={handleJobUpdate} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[9px] flex-1">
          <ApplicationsManager 
            applications={applications} 
            selectedApplication={selectedApplication} 
            onSelectApplication={setSelectedApplication} 
            selectedApplications={selectedApplications} 
            onSelectApplications={setSelectedApplications} 
            onSendEmail={() => setEmailModalOpen(true)} 
            onApplicationUpdate={handleApplicationUpdate} 
            job={job} 
          />
        </div>

        <Footer />
      </div>

      <EmailComposerModal 
        open={emailModalOpen} 
        onOpenChange={setEmailModalOpen} 
        selectedApplications={selectedApplicationsData} 
        job={job} 
      />

      <JobCreatorPanel 
        open={createJobOpen} 
        onOpenChange={setCreateJobOpen} 
      />
    </div>
  );
};
