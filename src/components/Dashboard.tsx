
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useApplications } from "@/hooks/useApplications";
import { useJobs } from "@/hooks/useJobs";
import { DashboardSkeleton } from "./dashboard/DashboardSkeleton";
import { ApplicationsManager } from "./dashboard/ApplicationsManager";
import { EnhancedDashboardHeader } from "./dashboard/EnhancedDashboardHeader";
import { getTimeAgo } from "@/utils/dateUtils";
import { Application } from "@/types";

export const Dashboard = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const { data: applications, isLoading: applicationsLoading, refetch: refetchApplications } = useApplications(jobId);
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const job = jobs?.find(j => j.id === jobId);
  const isLoading = applicationsLoading || jobsLoading;

  // Handle selectedApplicationId from navigation state (from Scout) or session storage (from new tab)
  useEffect(() => {
    let selectedApplicationId = location.state?.selectedApplicationId;
    
    // Check session storage if not found in location state (for new tab opens)
    if (!selectedApplicationId) {
      try {
        selectedApplicationId = sessionStorage.getItem('selectedApplicationId');
        if (selectedApplicationId) {
          // Clear it after use
          sessionStorage.removeItem('selectedApplicationId');
        }
      } catch (error) {
        console.warn('Could not access session storage:', error);
      }
    }
    
    if (selectedApplicationId && applications) {
      const application = applications.find(app => app.id === selectedApplicationId);
      if (application) {
        setSelectedApplication(application);
      }
    }
  }, [location.state, applications]);

  const handleSelectApplication = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleSendEmail = () => {
    console.log("Send email to selected applications:", selectedApplications);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!job) {
    return (
      <div className="min-h-screen cosmos-flowers-background relative overflow-hidden flex items-center justify-center">
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/15 to-purple-400/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center backdrop-blur-xl bg-white/25 border border-white/40 rounded-3xl shadow-2xl shadow-black/10 p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
          <p className="text-gray-600">The job you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmos-flowers-background relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-400/15 to-purple-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/10 to-pink-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <EnhancedDashboardHeader
          job={job}
          applications={applications || []}
          getTimeAgo={getTimeAgo}
          onJobUpdate={refetchApplications}
        />

        <ApplicationsManager
          applications={applications || []}
          selectedApplication={selectedApplication}
          onSelectApplication={handleSelectApplication}
          selectedApplications={selectedApplications}
          onSelectApplications={setSelectedApplications}
          onSendEmail={handleSendEmail}
          onApplicationUpdate={refetchApplications}
          job={job}
        />
      </div>
    </div>
  );
};
