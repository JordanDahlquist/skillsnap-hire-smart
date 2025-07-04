
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
