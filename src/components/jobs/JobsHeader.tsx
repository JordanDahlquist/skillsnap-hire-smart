
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getWelcomeMessage, getWelcomeSubtitle } from "@/utils/welcomeMessages";

interface JobsHeaderProps {
  userDisplayName: string;
  onCreateJob: () => void;
}

export const JobsHeader = ({ userDisplayName, onCreateJob }: JobsHeaderProps) => {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getWelcomeMessage(userDisplayName)}
          </h1>
          <p className="text-lg text-gray-600">
            {getWelcomeSubtitle()}
          </p>
        </div>
        <Button 
          onClick={onCreateJob}
          className="bg-[#007af6] hover:bg-[#0056b3] px-6 py-3 text-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Job
        </Button>
      </div>
    </div>
  );
};
