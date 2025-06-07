
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedHeader } from "../UnifiedHeader";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { ApplicationsManager } from "./ApplicationsManager";
import { EmailComposerModal } from "./EmailComposerModal";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { logger } from "@/services/loggerService";

interface Application {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  created_at: string;
  ai_rating: number | null;
  ai_summary: string | null;
  status: string;
  experience: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
  manual_rating: number | null;
  rejection_reason: string | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  role_type: string;
  experience_level: string;
  required_skills: string;
  budget: string;
  duration: string;
  status: string;
  created_at: string;
}

export const DashboardPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Fetch job details with error handling
  const { data: job, isLoading: jobLoading, error: jobError, refetch: refetchJob } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No job ID provided');
      
      logger.debug('Fetching job details for ID:', jobId);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();
      
      if (error) {
        logger.error('Job fetch error:', error);
        throw error;
      }
      
      if (!data) {
        logger.warn('No job found with ID:', jobId);
        throw new Error('Job not found');
      }
      
      return data as Job;
    },
    enabled: !!jobId,
    retry: 1,
  });

  // Fetch applications for this job with error handling
  const { data: applications = [], isLoading: applicationsLoading, error: applicationsError, refetch: refetchApplications } = useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      logger.debug('Fetching applications for job ID:', jobId);
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Applications fetch error:', error);
        throw error;
      }
      
      logger.debug('Applications fetched:', data?.length || 0);
      return data as Application[];
    },
    enabled: !!jobId,
    retry: 1,
  });

  // Set first application as selected when applications load
  useEffect(() => {
    if (applications.length > 0 && !selectedApplication) {
      setSelectedApplication(applications[0]);
    }
  }, [applications, selectedApplication]);

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

  // Loading state with skeleton
  if (jobLoading || applicationsLoading) {
    return <DashboardSkeleton />;
  }

  // Error states
  if (jobError || applicationsError) {
    logger.error('Dashboard errors:', { jobError, applicationsError });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">
            {jobError ? 'Failed to load job details.' : 'Failed to load applications.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600">The job you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const selectedApplicationsData = applications.filter(app => selectedApplications.includes(app.id));

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Dashboard", href: "/jobs" },
    { label: job.title, isCurrentPage: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader breadcrumbs={breadcrumbs} showCreateButton={false} />
      
      <DashboardHeader 
        job={job} 
        applications={applications}
        onJobUpdate={handleJobUpdate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <DashboardAnalytics applications={applications} job={job} />

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
      </div>

      <EmailComposerModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        selectedApplications={selectedApplicationsData}
        job={job}
      />
    </div>
  );
};
