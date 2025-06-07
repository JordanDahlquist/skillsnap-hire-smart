
import { useState } from "react";
import { Loader2, Sparkles, TrendingUp, Users, Bell, RefreshCw, BarChart3, FileText, Heart } from "lucide-react";
import { useDailyBriefing } from "@/hooks/useDailyBriefing";
import { useRegenerateBriefing } from "@/hooks/useRegenerateBriefing";
import { useJobs } from "@/hooks/useJobs";
import { useHiringAnalytics } from "@/hooks/useHiringAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseMarkdown } from "@/utils/markdownParser";
import { AnalyticsModal } from "@/components/analytics/AnalyticsModal";
import { generatePDFReport } from "@/utils/pdfReportGenerator";
import { useToast } from "@/hooks/use-toast";

interface AIDailyBriefingProps {
  userDisplayName: string;
  onCreateJob: () => void;
}

export const AIDailyBriefing = ({ userDisplayName, onCreateJob }: AIDailyBriefingProps) => {
  const { data: briefing, isLoading, error } = useDailyBriefing();
  const { regenerate, isRegenerating, remainingRegenerations, canRegenerate } = useRegenerateBriefing();
  const { data: jobs = [] } = useJobs();
  const analytics = useHiringAnalytics();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getScoutFallbackContent = () => {
    return `Hey ${userDisplayName}! 👋 Scout here, your cheerful hiring buddy! I'm so excited to help you build an amazing team. Every day I'll swing by with updates, insights, and a healthy dose of enthusiasm for your hiring journey! 🚀`;
  };

  const formatBriefingContent = (content: string) => {
    // Split into sentences and format intelligently
    const sentences = content.split(/(?<=[.!?])\s+/);
    
    if (sentences.length === 0) {
      return { greeting: content, content: '' };
    }
    
    // First sentence as greeting
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
          <span className="text-sm text-gray-600">Scout is preparing your daily update...</span>
        </div>
      );
    }

    if (error || !briefing) {
      const fallback = getScoutFallbackContent();
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

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      toast({
        title: "Scout's Report Generator",
        description: "I'm creating your comprehensive PDF report with all the good stuff! 📊",
      });

      const reportData = {
        metrics: analytics.metrics,
        pipelineData: analytics.pipelineData,
        trendData: analytics.trendData,
        jobPerformanceData: analytics.jobPerformanceData,
        jobs,
        userDisplayName
      };

      await generatePDFReport(reportData);
      
      toast({
        title: "Report Ready! 🎉",
        description: "Scout's comprehensive hiring analytics report has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Oops! Scout Hit a Snag",
        description: "There was an error generating your report. Let me try that again!",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegenerate = () => {
    regenerate();
    toast({
      title: "Scout's Getting Fresh Insights!",
      description: `Regenerating your update... You have ${remainingRegenerations - 1} regenerations left today!`,
    });
  };

  const insights = getInsightIcons();

  return (
    <div className="py-4 px-8">
      <div className="max-w-7xl mx-auto">
        <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            {/* Header with Scout's badge and regenerate button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  Scout's Daily Update
                </span>
                <Sparkles className="w-3 h-3 text-yellow-500" />
              </div>
              
              <Button
                onClick={handleRegenerate}
                disabled={!canRegenerate || isRegenerating}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2 hover:bg-blue-50"
              >
                {isRegenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Ask Scout Again ({remainingRegenerations} left)
              </Button>
            </div>

            {/* Main content */}
            <div className="mb-4">
              {getDisplayContent()}
            </div>
            
            {/* Insights */}
            {insights && insights.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 text-sm mb-6 pb-4 border-b border-gray-100">
                {insights.map((insight, index) => {
                  const IconComponent = insight.icon;
                  return (
                    <div key={index} className="flex items-center gap-1.5">
                      <IconComponent className={`w-3 h-3 ${insight.color}`} />
                      <span className="text-gray-600 text-xs">{insight.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={onCreateJob}
                className="bg-[#007af6] hover:bg-[#0056b3] text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Users className="w-4 h-4 mr-2" />
                Let's Find Great Talent!
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="text-sm hover:bg-blue-50"
                onClick={() => setShowAnalytics(true)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Scout's Analytics
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="text-sm hover:bg-green-50"
                onClick={handleExportReport}
                disabled={isExporting || analytics.isLoading}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Scout's Full Report
              </Button>
            </div>

            {/* Scout's tip about regenerations for first-time users */}
            {jobs.length === 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                  💡 <strong>Scout's tip:</strong> I'll give you a fresh daily update every morning! Plus, if you want me to take another look at things, just hit "Ask Scout Again" - you get 3 regenerations per day to keep things interesting!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AnalyticsModal 
        open={showAnalytics} 
        onOpenChange={setShowAnalytics}
        userDisplayName={userDisplayName}
      />
    </div>
  );
};
