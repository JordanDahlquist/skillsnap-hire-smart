
import { useState } from "react";
import { Loader2, Sparkles, TrendingUp, Users, Bell, RefreshCw, BarChart3, FileText, Plus, Briefcase, Calendar } from "lucide-react";
import { useDailyBriefing } from "@/hooks/useDailyBriefing";
import { useRegenerateBriefing } from "@/hooks/useRegenerateBriefing";
import { useJobs } from "@/hooks/useJobs";
import { useHiringAnalytics } from "@/hooks/useHiringAnalytics";
import { useBriefingMetrics } from "@/hooks/useBriefingMetrics";
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
  const metrics = useBriefingMetrics();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getFallbackContent = () => {
    const now = new Date();
    const hour = now.getHours();
    let timeBasedGreeting = 'Hello';
    
    if (hour >= 6 && hour < 12) {
      timeBasedGreeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      timeBasedGreeting = 'Good afternoon';
    } else if (hour >= 18 && hour < 24) {
      timeBasedGreeting = 'Good evening';
    }

    return `${timeBasedGreeting}, ${userDisplayName}! Ready to find your next great hire? Your hiring dashboard is waiting for you.`;
  };

  const cleanBriefingContent = (content: string) => {
    // Remove any stray asterisks and clean up the content
    return content
      .replace(/\*\*/g, '') // Remove all double asterisks
      .replace(/\*/g, '') // Remove all single asterisks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const formatBriefingContent = (content: string) => {
    // Clean the content first
    const cleanedContent = cleanBriefingContent(content);
    
    // Split into sentences
    const sentences = cleanedContent.split(/(?<=[.!?])\s+/);
    
    if (sentences.length === 0) {
      return { greeting: cleanedContent, content: '' };
    }
    
    // First sentence as greeting
    const greeting = sentences[0];
    const restContent = sentences.slice(1).join(' ');
    
    return { greeting, content: restContent };
  };

  const getDisplayContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-sm text-foreground">Generating your daily briefing...</span>
        </div>
      );
    }

    if (error || !briefing) {
      const fallback = getFallbackContent();
      const formatted = formatBriefingContent(fallback);
      return (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{formatted.greeting}</h2>
          {formatted.content && (
            <div className="text-sm text-foreground leading-relaxed">
              {formatted.content}
            </div>
          )}
        </div>
      );
    }

    const formatted = formatBriefingContent(briefing.briefing_content);
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">{formatted.greeting}</h2>
        {formatted.content && (
          <div className="text-sm text-foreground leading-relaxed">
            {formatted.content}
          </div>
        )}
      </div>
    );
  };

  const getMetricsData = () => {
    return [
      {
        icon: Bell,
        label: `${metrics.needsReview} need${metrics.needsReview === 1 ? 's' : ''} review`,
        color: "text-orange-500"
      },
      {
        icon: Users,
        label: `${metrics.newApplicantsThisWeek} new this week`,
        color: "text-blue-500"
      },
      {
        icon: Briefcase,
        label: `${metrics.totalJobsActive} active job${metrics.totalJobsActive === 1 ? '' : 's'}`,
        color: "text-green-500"
      },
      {
        icon: Calendar,
        label: `${metrics.newApplicantsToday} new today`,
        color: "text-purple-500"
      }
    ];
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      toast({
        title: "Generating Report",
        description: "Creating your comprehensive PDF report with analytics...",
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
        title: "Report Generated",
        description: "Your comprehensive hiring analytics report has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const metricsData = getMetricsData();

  return (
    <div className="py-4 px-8">
      <div className="max-w-7xl mx-auto">
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg glass-card-no-hover">
          <CardContent className="p-6">
            {/* Header with AI badge and regenerate button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  AI Daily Briefing
                </span>
              </div>
              
              <Button
                onClick={regenerate}
                disabled={!canRegenerate || isRegenerating}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
              >
                {isRegenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Regenerate ({remainingRegenerations} left)
              </Button>
            </div>

            {/* Main content */}
            <div className="mb-4">
              {getDisplayContent()}
            </div>
            
            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6 pb-4 border-b border-border">
              {metricsData.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className="flex items-center gap-1.5">
                    <IconComponent className={`w-3 h-3 ${metric.color}`} />
                    <span className="text-foreground text-xs">{metric.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={onCreateJob}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Job
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={() => setShowAnalytics(true)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={handleExportReport}
                disabled={isExporting || analytics.isLoading}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Export PDF Report
              </Button>
            </div>
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
