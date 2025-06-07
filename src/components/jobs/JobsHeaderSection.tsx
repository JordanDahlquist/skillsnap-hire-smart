
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
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-b border-gray-100 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20 -translate-x-32 -translate-y-32"></div>
        <div className="absolute top-20 right-0 w-48 h-48 bg-indigo-200 rounded-full blur-2xl opacity-30 translate-x-24 -translate-y-12"></div>
        <div className="absolute bottom-0 left-1/2 w-80 h-32 bg-purple-100 rounded-full blur-2xl opacity-25 -translate-x-40 translate-y-16"></div>
      </div>
      
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
