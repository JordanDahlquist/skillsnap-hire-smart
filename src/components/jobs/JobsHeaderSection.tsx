
import { AIDailyBriefing } from "./AIDailyBriefing";
import { JobsStats } from "./JobsStats";
import { JobStats } from "@/hooks/useJobStats";

interface JobsHeaderSectionProps {
  userDisplayName: string;
  onCreateJob: () => void;
  stats: JobStats;
  onNeedsAttentionClick?: () => void;
  needsAttentionActive?: boolean;
  onActiveJobsClick?: () => void;
  activeJobsFilterActive?: boolean;
}

export const JobsHeaderSection = ({
  userDisplayName,
  onCreateJob,
  stats,
  onNeedsAttentionClick,
  needsAttentionActive,
  onActiveJobsClick,
  activeJobsFilterActive
}: JobsHeaderSectionProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <AIDailyBriefing 
          userDisplayName={userDisplayName}
          onCreateJob={onCreateJob}
        />
        <JobsStats 
          stats={stats} 
          onNeedsAttentionClick={onNeedsAttentionClick}
          needsAttentionActive={needsAttentionActive}
          onActiveJobsClick={onActiveJobsClick}
          activeJobsFilterActive={activeJobsFilterActive}
        />
      </div>
    </div>
  );
};
