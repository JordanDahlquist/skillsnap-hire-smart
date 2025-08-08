
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, 
  Briefcase, 
  Star, 
  Clock, 
  Target,
  CheckCircle,
  TrendingUp,
  ThumbsUp
} from "lucide-react";
import { HiringMetrics, PipelineData } from "@/hooks/useHiringAnalytics";
import { PerformanceScoreCard } from "./overview/PerformanceScoreCard";
import { EnhancedMetricCard } from "./overview/EnhancedMetricCard";


interface OverviewTabProps {
  analytics: {
    metrics: HiringMetrics;
    pipelineData: PipelineData;
  };
}

export const OverviewTab = ({ analytics }: OverviewTabProps) => {
  const { metrics, pipelineData } = analytics;

  const metricCards = [
    {
      title: "Active Job Postings",
      value: metrics.totalJobs,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Number of currently active job listings across all positions",
      benchmark: { label: "Avg for your size", value: "3-5 jobs" },
      suggestion: metrics.totalJobs < 3 ? "Consider posting more roles to increase pipeline" : undefined
    },
    {
      title: "Total Applications",
      value: metrics.totalApplications,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Total number of applications received across all job postings",
      trend: {
        direction: 'up' as const,
        value: `+${metrics.applicationsThisWeek}`,
        isPositive: true
      },
      suggestion: metrics.totalApplications < 50 ? "Promote jobs on more channels to increase volume" : undefined
    },
    {
      title: "Application Quality",
      value: `${metrics.avgRating.toFixed(1)}/3.0`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Average AI-assessed quality score of all applications received",
      benchmark: { label: "Good quality", value: "2.0+" },
      suggestion: metrics.avgRating < 2.0 ? "Refine job requirements to attract better candidates" : undefined
    },
    {
      title: "Hired Rate",
      value: `${metrics.hiredRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Percentage of applications that resulted in successful hires",
      benchmark: { label: "Competitive rate", value: "2-5%" },
      trend: {
        direction: metrics.hiredRate > 3 ? 'up' as const : 'down' as const,
        value: metrics.hiredRate > 3 ? "Above avg" : "Below avg",
        isPositive: metrics.hiredRate > 3
      }
    },
    {
      title: "Weekly Applications",
      value: metrics.applicationsThisWeek,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Number of new applications received in the past 7 days",
      benchmark: { label: "Healthy rate", value: "10+ per week" },
      suggestion: metrics.applicationsThisWeek < 5 ? "Consider boosting job promotion or adjusting requirements" : undefined
    },
    {
      title: "Response Time",
      value: `${metrics.avgTimeToResponse.toFixed(1)} days`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Average time taken to respond to candidate applications",
      benchmark: { label: "Best practice", value: "< 2 days" },
      suggestion: metrics.avgTimeToResponse > 3 ? "Set up automated responses to improve candidate experience" : undefined
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
      {/* Performance Score - Now Compact */}
      <PerformanceScoreCard metrics={metrics} />

      {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricCards.map((metric, index) => (
            <div key={index} className="hover-scale animate-fade-in">
              <EnhancedMetricCard {...metric} />
            </div>
          ))}
        </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-left">
              <Target className="w-5 h-5 text-primary" />
              Pipeline Status
            </CardTitle>
            <p className="text-sm text-muted-foreground">Quick view of applications across stages</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'pending', label: 'Pending Review', value: pipelineData.pending, Icon: Clock, tone: 'warning', tooltip: 'Applications awaiting review' },
                { key: 'approved', label: 'Approved', value: pipelineData.approved, Icon: CheckCircle, tone: 'success', tooltip: 'Applications moved forward' },
                { key: 'rejected', label: 'Rejected', value: pipelineData.rejected, Icon: ThumbsUp, tone: 'destructive', tooltip: 'Applications not moving forward' }
              ].map((s) => (
                <Tooltip key={s.key}>
                  <TooltipTrigger asChild>
                    <div className="rounded-xl border bg-card/50 p-4 shadow-sm hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <s.Icon className={`w-4 h-4 ${s.tone === 'warning' ? 'text-yellow-600' : s.tone === 'success' ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
                          <span className="text-sm font-medium">{s.label}</span>
                        </div>
                        <span className={`text-lg font-semibold ${s.tone === 'warning' ? 'text-yellow-700' : s.tone === 'success' ? 'text-green-700' : 'text-red-700'}`}>{s.value}</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{s.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </TooltipProvider>
  );
};
