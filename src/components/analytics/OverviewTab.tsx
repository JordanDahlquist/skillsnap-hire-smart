
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ActionableInsights } from "./overview/ActionableInsights";

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
    <div className="space-y-6">
      {/* Performance Score - Now Compact */}
      <PerformanceScoreCard metrics={metrics} />

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric, index) => (
          <EnhancedMetricCard
            key={index}
            {...metric}
          />
        ))}
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Pipeline Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Pending Review</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {pipelineData.pending}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Approved</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {pipelineData.approved}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-red-600 rotate-180" />
                <span className="text-sm font-medium">Rejected</span>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {pipelineData.rejected}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actionable Insights takes 2 columns */}
        <div className="lg:col-span-2">
          <ActionableInsights metrics={metrics} pipelineData={pipelineData} />
        </div>
      </div>
    </div>
  );
};
