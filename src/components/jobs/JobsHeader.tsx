
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getWelcomeMessage, getWelcomeSubtitle } from "@/utils/welcomeMessages";

interface JobsHeaderProps {
  userDisplayName: string;
  onCreateJob: () => void;
}

export const JobsHeader = ({ userDisplayName, onCreateJob }: JobsHeaderProps) => {
  return (
    <div className="py-12 px-8 textured-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {getWelcomeMessage(userDisplayName)}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
              {getWelcomeSubtitle()}
            </p>
          </div>
          <div className="flex-shrink-0 relative">
            <Button 
              onClick={onCreateJob}
              variant="glass-premium"
              size="lg"
              className="glass-button-premium text-lg font-semibold px-10 py-5 relative z-10"
            >
              <Plus className="w-6 h-6 mr-3" />
              Create New Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
