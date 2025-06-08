
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Star, 
  Clock, 
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { HiringMetrics, PipelineData } from "@/hooks/useHiringAnalytics";

interface OverviewTabProps {
  analytics: {
    metrics: HiringMetrics;
    pipelineData: PipelineData;
  };
}

export const OverviewTab = ({ analytics }: OverviewTabProps) => {
  const { metrics, pipelineData } = analytics;

  const getPerformanceScore = () => {
    const ratingScore = (metrics.avgRating / 3) * 30;
    const approvalScore = (metrics.approvalRate / 100) * 40;
    const activityScore = Math.min(metrics.applicationsThisWeek / 10, 1) * 30;
    return Math.round(ratingScore + approvalScore + activityScore);
  };

  const performanceScore = getPerformanceScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const metricCards = [
    {
      title: "Total Jobs",
      value: metrics.totalJobs,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Applications",
      value: metrics.totalApplications,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Approval Rate",
      value: `${metrics.approvalRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Avg Rating",
      value: metrics.avgRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "This Week",
      value: metrics.applicationsThisWeek,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Avg Response Time",
      value: `${metrics.avgTimeToResponse.toFixed(1)}d`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Score Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Hiring Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}/100
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {performanceScore >= 80 ? "Excellent" : performanceScore >= 60 ? "Good" : "Needs Improvement"}
              </p>
            </div>
            <div className="w-32">
              <Progress value={performanceScore} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Summary */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Review</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pipelineData.pending}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {pipelineData.approved}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {pipelineData.rejected}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Insights */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topPerformingJob && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Top Performing Job</p>
                  <p className="text-xs text-gray-600">{metrics.topPerformingJob}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Weekly Growth</p>
                <p className="text-xs text-gray-600">
                  {metrics.applicationsThisWeek} applications this week
                </p>
              </div>
            </div>
            
            {pipelineData.pending > 10 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Action Needed</p>
                  <p className="text-xs text-gray-600">
                    {pipelineData.pending} applications awaiting review
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
