
import { useNavigate } from "react-router-dom";
import type { Application } from "@/types";

export const useEmailNavigation = () => {
  const navigate = useNavigate();

  const navigateToEmailTab = (application: Application, jobId?: string) => {
    // Navigate to candidate detail page with email tab
    const candidateUrl = `/candidate/${application.id}?tab=email`;
    navigate(candidateUrl);
  };

  const navigateToEmailTabFromJob = (jobId: string, applicationId: string) => {
    // Navigate to candidate detail page from job context with email tab
    const candidateUrl = `/jobs/${jobId}/candidate/${applicationId}?tab=email`;
    navigate(candidateUrl);
  };

  return {
    navigateToEmailTab,
    navigateToEmailTabFromJob
  };
};
