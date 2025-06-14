
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  TrendingUp,
  Users,
  Star
} from "lucide-react";
import { HiringMetrics, PipelineData } from "@/hooks/useHiringAnalytics";

interface ActionableInsightsProps {
  metrics: HiringMetrics;
  pipelineData: PipelineData;
}

export const ActionableInsights = ({ metrics, pipelineData }: ActionableInsightsProps) => {
  const insights = [
    {
      type: "urgent" as const,
      icon: AlertTriangle,
      title: "Review Pending Applications",
      description: `${pipelineData.pending} applications need your attention`,
      action: "Review Now",
      priority: "High",
      visible: pipelineData.pending > 10,
      impact: "Faster responses improve candidate experience by 40%"
    },
    {
      type: "opportunity" as const,
      icon: TrendingUp,
      title: "Optimize Job Descriptions",
      description: `Approval rate is ${metrics.approvalRate.toFixed(1)}% - industry average is 25%`,
      action: "Improve JDs",
      priority: "Medium",
      visible: metrics.approvalRate < 20,
      impact: "Better job descriptions increase quality applications by 60%"
    },
    {
      type: "success" as const,
      icon: CheckCircle,
      title: "High-Quality Applications",
      description: `Average rating of ${metrics.avgRating.toFixed(1)}/3.0 shows good targeting`,
      action: "Maintain",
      priority: "Low",
      visible: metrics.avgRating >= 2.0,
      impact: "Keep using current sourcing channels"
    },
    {
      type: "growth" as const,
      icon: Target,
      title: "Increase Application Volume",
      description: `Only ${metrics.applicationsThisWeek} applications this week`,
      action: "Promote Jobs",
      priority: "Medium",
      visible: metrics.applicationsThisWeek < 5,
      impact: "More promotion increases applications by 200%"
    },
    {
      type: "efficiency" as const,
      icon: Clock,
      title: "Speed Up Response Time",
      description: `${metrics.avgTimeToResponse.toFixed(1)} days average response time`,
      action: "Set Reminders",
      priority: "High",
      visible: metrics.avgTimeToResponse > 3,
      impact: "Faster responses improve acceptance rates by 30%"
    }
  ];

  const visibleInsights = insights.filter(insight => insight.visible);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent": return "text-red-600";
      case "opportunity": return "text-blue-600";
      case "success": return "text-green-600";
      case "growth": return "text-purple-600";
      case "efficiency": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Actionable Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleInsights.length > 0 ? (
          <div className="space-y-4">
            {visibleInsights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 mt-0.5 ${getTypeColor(insight.type)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <p className="text-xs text-blue-600 font-medium">💡 {insight.impact}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-3">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Everything Looks Great!</h3>
            <p className="text-gray-600">Your hiring process is performing well. Keep up the good work!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
