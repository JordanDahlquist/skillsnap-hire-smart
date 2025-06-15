
import { CompactDashboardHeader } from "./CompactDashboardHeader";
import { getTimeAgo } from "@/utils/dateUtils";
import { Job, Application } from "@/types";

interface DashboardHeaderProps {
  job: Job;
  applications: Application[];
  onJobUpdate: () => void;
}

export const DashboardHeader = ({ job, applications, onJobUpdate }: DashboardHeaderProps) => {
  return (
    <CompactDashboardHeader 
      job={job} 
      applications={applications}
      getTimeAgo={getTimeAgo}
      onJobUpdate={onJobUpdate}
    />
  );
};
