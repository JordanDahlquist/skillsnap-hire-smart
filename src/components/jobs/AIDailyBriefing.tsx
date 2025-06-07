
import { Loader2, Sparkles, TrendingUp, Users, Bell } from "lucide-react";
import { useDailyBriefing } from "@/hooks/useDailyBriefing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseMarkdown } from "@/utils/markdownParser";

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

  // Format the briefing content for better readability
  const formatBriefingContent = (content: string) => {
    // Split into sentences and format intelligently
    const sentences = content.split(/(?<=[.!?])\s+/);
    
    if (sentences.length === 0) {
      return { greeting: content, content: '' };
    }
    
    // First sentence as greeting (usually starts with "Good morning" or similar)
    const greeting = sentences[0];
    const restContent = sentences.slice(1).join(' ');
    
    // Format the rest of the content with markdown-like parsing
    const formattedRest = restContent
      // Bold numbers and metrics
      .replace(/(\d+\+?\s*(?:job|application|candidate|pending|approved|high-rated)[s]?)/gi, '**$1**')
      // Bold job titles (assuming they're in quotes or after "job" mentions)
      .replace(/"([^"]+)"/g, '**"$1"**')
      // Bold attention indicators
      .replace(/(need[s]?\s+attention|high[- ]rated|new\s+this\s+week)/gi, '**$1**');
    
    return { greeting, content: formattedRest };
  };

  const getDisplayContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Generating your daily briefing...</span>
        </div>
      );
    }

    if (error || !briefing) {
      const fallback = getFallbackContent();
      const formatted = formatBriefingContent(fallback);
      return (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">{formatted.greeting}</h2>
          {formatted.content && (
            <div 
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(formatted.content) }}
            />
          )}
        </div>
      );
    }

    const formatted = formatBriefingContent(briefing.briefing_content);
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">{formatted.greeting}</h2>
        {formatted.content && (
          <div 
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(formatted.content) }}
          />
        )}
      </div>
    );
  };

  const getInsightCards = () => {
    if (!briefing?.briefing_data) return [];

    const data = briefing.briefing_data;
    const cards = [];

    if (data.jobs_needing_attention > 0) {
      cards.push({
        icon: Bell,
        value: data.jobs_needing_attention,
        label: `Job${data.jobs_needing_attention === 1 ? '' : 's'} need attention`,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      });
    }

    if (data.high_rated_applications > 0) {
      cards.push({
        icon: TrendingUp,
        value: data.high_rated_applications,
        label: `High-rated candidate${data.high_rated_applications === 1 ? '' : 's'}`,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      });
    }

    return cards;
  };

  const insightCards = getInsightCards();

  return (
    <div className="py-4 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left side - Briefing text */}
          <div className="space-y-2 flex-1 max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                AI Daily Briefing
              </span>
            </div>
            
            {getDisplayContent()}
          </div>
          
          {/* Right side - Insight cards and Create button */}
          <div className="flex flex-col gap-3 lg:min-w-[280px]">
            {/* Insight cards */}
            {insightCards.length > 0 && (
              <div className="space-y-2">
                {insightCards.map((card, index) => {
                  const IconComponent = card.icon;
                  return (
                    <Card key={index} className={`${card.bgColor} ${card.borderColor} border`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center`}>
                            <IconComponent className={`w-4 h-4 ${card.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-lg font-bold ${card.color}`}>
                              {card.value}
                            </div>
                            <div className="text-xs text-gray-600 leading-tight">
                              {card.label}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {/* Create Job button */}
            <Button 
              onClick={onCreateJob}
              className="bg-[#007af6] hover:bg-[#0056b3] text-white px-6 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 w-full"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Create New Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
