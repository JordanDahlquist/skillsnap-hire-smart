import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useOptimizedJob } from "@/hooks/useOptimizedJobs";
import { useOptimizedApplications } from "@/hooks/useOptimizedApplications";
import { UnifiedHeader } from "../UnifiedHeader";
import { DashboardHeader } from "./DashboardHeader";
import { ApplicationsManager } from "./ApplicationsManager";
import { EmailComposerModal } from "./EmailComposerModal";
import { JobCreatorPanel } from "../JobCreatorPanel";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { logger } from "@/services/loggerService";
import { Application, Job } from "@/types";
export const DashboardPage = () => {
  const {
    jobId
  } = useParams<{
    jobId: string;
  }>();
  const [searchParams] = useSearchParams();
  const {
    user
  } = useOptimizedAuth(); // Use optimized auth
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

  // Loading state with skeleton - faster loading with parallel queries
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error states
  if (jobError || applicationsError) {
    logger.error('Dashboard errors:', {
      jobError,
      applicationsError
    });
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">
            {jobError ? 'Failed to load job details.' : 'Failed to load applications.'}
          </p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>;
  }
  if (!job) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600">The job you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>;
  }
  const selectedApplicationsData = applications.filter(app => selectedApplications.includes(app.id));
  return <div className="min-h-screen bg-gray-50">
      <UnifiedHeader onCreateRole={handleCreateJob} showCreateButton={true} />
      
      <DashboardHeader job={job} applications={applications} onJobUpdate={handleJobUpdate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[9px]">
        <ApplicationsManager applications={applications} selectedApplication={selectedApplication} onSelectApplication={setSelectedApplication} selectedApplications={selectedApplications} onSelectApplications={setSelectedApplications} onSendEmail={() => setEmailModalOpen(true)} onApplicationUpdate={handleApplicationUpdate} job={job} />
      </div>

      <EmailComposerModal open={emailModalOpen} onOpenChange={setEmailModalOpen} selectedApplications={selectedApplicationsData} job={job} />

      <JobCreatorPanel open={createJobOpen} onOpenChange={setCreateJobOpen} />
    </div>;
};