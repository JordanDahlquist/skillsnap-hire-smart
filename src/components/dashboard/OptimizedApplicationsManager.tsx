
import { memo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ApplicationsManager } from "./ApplicationsManager";
import { Application, Job } from "@/types";

interface OptimizedApplicationsManagerProps {
  applications: Application[];
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  selectedApplications: string[];
  onSelectApplications: (applications: string[]) => void;
  onSendEmail: () => void;
  onApplicationUpdate: () => void;
  job: Job;
}

const OptimizedApplicationsManagerComponent = memo(({
  applications,
  selectedApplication,
  onSelectApplication,
  selectedApplications,
  onSelectApplications,
  onSendEmail,
  onApplicationUpdate,
  job
}: OptimizedApplicationsManagerProps) => {
  return (
    <ApplicationsManager
      applications={applications}
      selectedApplication={selectedApplication}
      onSelectApplication={onSelectApplication}
      selectedApplications={selectedApplications}
      onSelectApplications={onSelectApplications}
      onSendEmail={onSendEmail}
      onApplicationUpdate={onApplicationUpdate}
      job={job}
    />
  );
});

OptimizedApplicationsManagerComponent.displayName = 'OptimizedApplicationsManagerComponent';

export const OptimizedApplicationsManager = (props: OptimizedApplicationsManagerProps) => {
  return (
    <ErrorBoundary>
      <OptimizedApplicationsManagerComponent {...props} />
    </ErrorBoundary>
  );
};
