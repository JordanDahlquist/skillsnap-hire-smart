
import { memo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ApplicationsManager } from "./ApplicationsManager";

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
