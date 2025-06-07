
import { Loader2, Sparkles, TrendingUp, Users, Bell } from "lucide-react";
import { useDailyBriefing } from "@/hooks/useDailyBriefing";
import { Button } from "@/components/ui/button";

interface AIDailyBriefingProps {
  userDisplayName: string;
  onCreateJob: () => void;
}

export const AIDailyBriefing = ({ userDisplayName, onCreateJob }: AIDailyBriefingProps) => {
  const { data: briefing, isLoading, error } = useDailyBriefing();

  // Fallback content
  const getFallbackContent = () => {
    return `Good morning, ${userDisplayName}! Ready to find your next great hire? Your hiring dashboard is waiting for you.`;
  };

  const getDisplayContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>Generating your daily briefing...</span>
        </div>
      );
    }

    if (error || !briefing) {
      return getFallbackContent();
    }

    return briefing.briefing_content;
  };

  const getInsightIcons = () => {
    if (!briefing?.briefing_data) return null;

    const data = briefing.briefing_data;
    const insights = [];

    if (data.jobs_needing_attention > 0) {
      insights.push({
        icon: Bell,
        label: `${data.jobs_needing_attention} need${data.jobs_needing_attention === 1 ? 's' : ''} attention`,
        color: "text-orange-500"
      });
    }

    if (data.high_rated_applications > 0) {
      insights.push({
        icon: TrendingUp,
        label: `${data.high_rated_applications} high-rated candidate${data.high_rated_applications === 1 ? '' : 's'}`,
        color: "text-green-500"
      });
    }

    if (data.recent_applications > 0) {
      insights.push({
        icon: Users,
        label: `${data.recent_applications} new this week`,
        color: "text-blue-500"
      });
    }

    return insights.slice(0, 3); // Show max 3 insights
  };

  const insights = getInsightIcons();

  return (
    <div className="py-8 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                AI Daily Briefing
              </span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              {getDisplayContent()}
            </h1>
            
            {insights && insights.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {insights.map((insight, index) => {
                  const IconComponent = insight.icon;
                  return (
                    <div key={index} className="flex items-center gap-1">
                      <IconComponent className={`w-4 h-4 ${insight.color}`} />
                      <span className="text-gray-600">{insight.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <Button 
              onClick={onCreateJob}
              className="bg-[#007af6] hover:bg-[#0056b3] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Users className="w-6 h-6 mr-3" />
              Create New Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
