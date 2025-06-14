
import { AIDailyBriefing } from "./AIDailyBriefing";

interface JobsHeaderSectionProps {
  userDisplayName: string;
  onCreateJob: () => void;
}

export const JobsHeaderSection = ({
  userDisplayName,
  onCreateJob
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
      </div>
    </div>
  );
};
