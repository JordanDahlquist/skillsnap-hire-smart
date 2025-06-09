
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useApplications } from "@/hooks/useApplications";
import { useJobs } from "@/hooks/useJobs";
import { useSelection } from "@/hooks/useSelection";
import { DashboardSkeleton } from "./dashboard/DashboardSkeleton";
import { ApplicationsManager } from "./dashboard/ApplicationsManager";
import { EnhancedDashboardHeader } from "./dashboard/EnhancedDashboardHeader";
import { Application } from "@/types";

export const Dashboard = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const { applications, isLoading: applicationsLoading, refetch: refetchApplications } = useApplications(jobId);
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { selectedItems: selectedApplications, handleSelection } = useSelection();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const job = jobs?.find(j => j.id === jobId);
  const isLoading = applicationsLoading || jobsLoading;

  // Handle selectedApplicationId from navigation state (from Scout)
  useEffect(() => {
    const selectedApplicationId = location.state?.selectedApplicationId;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
          <p className="text-gray-600">The job you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedDashboardHeader
        job={job}
        applications={applications || []}
        selectedApplications={selectedApplications}
        onSendEmail={handleSendEmail}
        onApplicationUpdate={refetchApplications}
      />

      <ApplicationsManager
        applications={applications || []}
        selectedApplication={selectedApplication}
        onSelectApplication={handleSelectApplication}
        selectedApplications={selectedApplications}
        onSelectApplications={handleSelection}
        onSendEmail={handleSendEmail}
        onApplicationUpdate={refetchApplications}
        job={job}
      />
    </div>
  );
};
