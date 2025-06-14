
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Target, TrendingUp, TrendingDown, HelpCircle, Zap } from "lucide-react";
import { HiringMetrics } from "@/hooks/useHiringAnalytics";

interface PerformanceScoreCardProps {
  metrics: HiringMetrics;
}

export const PerformanceScoreCard = ({ metrics }: PerformanceScoreCardProps) => {
  const getPerformanceScore = () => {
    const ratingScore = (metrics.avgRating / 3) * 30;
    const hiredScore = (metrics.hiredRate / 5) * 40; // Updated to use realistic 5% max
    const activityScore = Math.min(metrics.applicationsThisWeek / 10, 1) * 30;
    return Math.round(ratingScore + hiredScore + activityScore);
  };

  const performanceScore = getPerformanceScore();
  
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-50", suggestion: "Maintain your high performance! Focus on consistency." };
    if (score >= 60) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-50", suggestion: "You're on track. Consider improving response time or job descriptions." };
    if (score >= 40) return { level: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-50", suggestion: "Room for improvement. Focus on faster responses and better job targeting." };
    return { level: "Needs Work", color: "text-red-600", bgColor: "bg-red-50", suggestion: "Immediate action needed. Review job requirements and response processes." };
  };

  const scoreData = getScoreLevel(performanceScore);

  const breakdown = [
    { label: "Application Quality", value: (metrics.avgRating / 3) * 100, weight: "30%" },
    { label: "Hired Rate", value: Math.min((metrics.hiredRate / 5) * 100, 100), weight: "40%" },
    { label: "Weekly Activity", value: Math.min((metrics.applicationsThisWeek / 10) * 100, 100), weight: "30%" }
  ];

  return (
    <Card className={`border-0 shadow-md ${scoreData.bgColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className={`w-5 h-5 ${scoreData.color}`} />
          Hiring Performance Score
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Your overall hiring effectiveness based on application quality (30%), hired rate (40%), and weekly activity (30%).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`text-3xl font-bold ${scoreData.color}`}>
              {performanceScore}/100
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`${scoreData.color} border-current`}>
                {scoreData.level}
              </Badge>
              {performanceScore >= 70 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          <div className="w-24">
            <Progress value={performanceScore} className="h-3" />
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          {breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{item.label} ({item.weight})</span>
              <span className="font-medium">{item.value.toFixed(0)}%</span>
            </div>
          ))}
        </div>
        
        <div className={`p-3 rounded-lg border ${scoreData.bgColor} border-current border-opacity-20`}>
          <div className="flex items-start gap-2">
            <Zap className={`w-4 h-4 mt-0.5 ${scoreData.color}`} />
            <p className="text-sm font-medium">{scoreData.suggestion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
