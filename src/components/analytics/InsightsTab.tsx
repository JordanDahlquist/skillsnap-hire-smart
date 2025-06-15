
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  AlertTriangle, 
  Target, 
  Clock, 
  Star, 
  TrendingUp,
  Users,
  Award,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { JobPerformance, HiringMetrics } from "@/hooks/useHiringAnalytics";

interface InsightsTabProps {
  analytics: {
    jobPerformanceData: JobPerformance[];
    metrics: HiringMetrics;
  };
}

export const InsightsTab = ({ analytics }: InsightsTabProps) => {
  const { jobPerformanceData, metrics } = analytics;

  const topPerformingJobs = jobPerformanceData
    .filter(job => job.applications >= 3)
    .sort((a, b) => b.hiredRate - a.hiredRate)
    .slice(0, 5);

  const needsAttentionJobs = jobPerformanceData
    .filter(job => job.applications >= 10 && job.hiredRate < 2)
    .sort((a, b) => a.hiredRate - b.hiredRate)
    .slice(0, 3);

  const insights = [
    {
      type: "success",
      icon: Trophy,
      title: "High Performer Identified",
      description: `${topPerformingJobs[0]?.jobTitle || 'No job'} has the highest hired rate at ${topPerformingJobs[0]?.hiredRate.toFixed(1) || 0}%`,
      actionable: true
    },
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Applications Need Review",
      description: `${metrics.totalApplications > 0 ? Math.round((metrics.totalApplications - metrics.hiredRate * metrics.totalApplications / 100)) : 0} applications are still pending review`,
      actionable: true
    },
    {
      type: "info",
      icon: TrendingUp,
      title: "Weekly Growth",
      description: `${metrics.applicationsThisWeek} new applications this week, showing ${metrics.applicationsThisWeek > 10 ? 'strong' : 'moderate'} activity`,
      actionable: false
    },
    {
      type: "tip",
      icon: Lightbulb,
      title: "Optimization Opportunity",
      description: `Average response time is ${metrics.avgTimeToResponse.toFixed(1)} days. Consider faster responses to improve candidate experience`,
      actionable: true
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success": return "border-green-200 bg-green-50";
      case "warning": return "border-yellow-200 bg-yellow-50";
      case "info": return "border-blue-200 bg-blue-50";
      case "tip": return "border-purple-200 bg-purple-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "info": return "text-blue-600";
      case "tip": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className={`w-5 h-5 mt-1 ${getInsightIconColor(insight.type)}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 text-left">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 text-left">{insight.description}</p>
                      {insight.actionable && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Action Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Jobs */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            <Award className="w-5 h-5 text-yellow-600" />
            Top Performing Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingJobs.length > 0 ? topPerformingJobs.map((job, index) => (
              <div key={job.jobId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-left">{job.jobTitle}</h4>
                    <p className="text-sm text-gray-600 text-left">{job.applications} applications</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {job.hiredRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">hired rate</div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-8">No jobs with sufficient data yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-left">
              <Target className="w-5 h-5 text-blue-600" />
              Performance Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-left">Hired Rate Target</span>
                <span className="text-sm text-gray-600">{metrics.hiredRate.toFixed(1)}% / 5%</span>
              </div>
              <Progress value={Math.min((metrics.hiredRate / 5) * 100, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-left">Quality Score Target</span>
                <span className="text-sm text-gray-600">{metrics.avgRating.toFixed(1)} / 2.5</span>
              </div>
              <Progress value={Math.min((metrics.avgRating / 2.5) * 100, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-left">Weekly Applications</span>
                <span className="text-sm text-gray-600">{metrics.applicationsThisWeek} / 20</span>
              </div>
              <Progress value={Math.min((metrics.applicationsThisWeek / 20) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Jobs Needing Attention */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-left">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Jobs Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {needsAttentionJobs.length > 0 ? (
              <div className="space-y-3">
                {needsAttentionJobs.map((job) => (
                  <div key={job.jobId} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm text-left">{job.jobTitle}</h4>
                      <p className="text-xs text-gray-600 text-left">{job.applications} applications</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-600">
                        {job.hiredRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">low hired rate</div>
                    </div>
                  </div>
                ))}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 text-left">
                    💡 Consider reviewing job descriptions or requirements for these positions
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">All jobs performing well!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Advanced Analytics Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.totalJobs}</div>
              <div className="text-sm text-gray-600">Active Job Postings</div>
              <div className="text-xs text-gray-500 mt-1 text-left">
                {metrics.totalJobs > 5 ? 'Strong pipeline' : 'Consider expanding'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {metrics.avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Candidate Quality</div>
              <div className="text-xs text-gray-500 mt-1 text-left">
                {metrics.avgRating >= 2.5 ? 'Excellent quality' : 'Room for improvement'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.avgTimeToResponse.toFixed(1)}d
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
              <div className="text-xs text-gray-500 mt-1 text-left">
                {metrics.avgTimeToResponse <= 2 ? 'Quick response' : 'Could be faster'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
