
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getWelcomeMessage, getWelcomeSubtitle } from "@/utils/welcomeMessages";
import { useThemeContext } from "@/contexts/ThemeContext";

interface JobsHeaderProps {
  userDisplayName: string;
  onCreateJob: () => void;
}

export const JobsHeader = ({ userDisplayName, onCreateJob }: JobsHeaderProps) => {
  const { currentTheme } = useThemeContext();
  
  // Theme-aware text colors
  const titleColor = currentTheme === 'dark' ? 'text-white' : 'text-gray-900';
  const subtitleColor = currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-600';

  return (
    <div className="py-12 px-8 textured-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4">
            <h1 className={`text-4xl lg:text-5xl font-bold leading-tight ${titleColor}`}>
              {getWelcomeMessage(userDisplayName)}
            </h1>
            <p className={`text-xl max-w-2xl leading-relaxed ${subtitleColor}`}>
              {getWelcomeSubtitle()}
            </p>
          </div>
          <div className="flex-shrink-0 relative">
            <Button 
              onClick={onCreateJob}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-10 py-5"
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
