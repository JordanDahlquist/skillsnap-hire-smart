
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Application {
  status: string;
  ai_rating: number | null;
  created_at: string;
  experience: string | null;
}

interface Job {
  created_at: string;
  status: string;
}

interface PerformanceMetricsProps {
  applications: Application[];
  job: Job;
}

export const PerformanceMetrics = ({ applications, job }: PerformanceMetricsProps) => {
  // Calculate key metrics
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const highQualityApps = applications.filter(app => (app.ai_rating || 0) >= 4).length;
  const avgRating = totalApplications > 0 
    ? applications.reduce((sum, app) => sum + (app.ai_rating || 0), 0) / totalApplications 
    : 0;

  // Time-based calculations
  const jobAge = Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const jobAgeHours = Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60));
  const applicationsPerDay = jobAge > 0 ? (totalApplications / jobAge).toFixed(1) : totalApplications.toString();
  
  // Check if job is too new for meaningful analysis (less than 24 hours)
  const isTooNewForAnalysis = jobAgeHours < 24;
  
  // Mock performance benchmarks (in real app, these would come from analytics)
  const benchmarkAppsPerDay = 3.2;
  const benchmarkApprovalRate = 25;
  const benchmarkQualityScore = 65;

  // Calculate performance scores (but only use them if job is old enough)
  const velocityScore = jobAge > 0 ? Math.min(100, Math.round((parseFloat(applicationsPerDay) / benchmarkAppsPerDay) * 100)) : 0;
  const approvalRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0;
  const qualityScore = totalApplications > 0 ? Math.round((highQualityApps / totalApplications) * 100) : 0;

  // Overall job health score - but show neutral score for new jobs
  let healthScore;
  if (isTooNewForAnalysis) {
    // For new jobs, show a neutral score that doesn't trigger negative feedback
    healthScore = 70; // Neutral "Good" score
  } else {
    healthScore = Math.round((velocityScore + Math.min(100, (approvalRate / benchmarkApprovalRate) * 100) + Math.min(100, (qualityScore / benchmarkQualityScore) * 100)) / 3);
  }

  const getHealthColor = (score: number) => {
    if (isTooNewForAnalysis) return "text-blue-600"; // Neutral blue for new jobs
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadge = (score: number) => {
    if (isTooNewForAnalysis) return { text: "Monitoring", color: "bg-blue-100 text-blue-800" };
    if (score >= 80) return { text: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 60) return { text: "Good", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Needs Attention", color: "bg-red-100 text-red-800" };
  };

  // Only show recommendations for jobs that are old enough for meaningful analysis
  const recommendations = [];
  if (!isTooNewForAnalysis) {
    if (velocityScore < 60) {
      recommendations.push("Consider improving job visibility or adjusting requirements");
    }
    if (approvalRate < benchmarkApprovalRate && totalApplications > 5) {
      recommendations.push("Review application criteria - approval rate is below average");
    }
    if (qualityScore < benchmarkQualityScore && totalApplications > 3) {
      recommendations.push("Consider refining job description to attract higher quality candidates");
    }
    if (jobAge > 30 && totalApplications < 10) {
      recommendations.push("Job may need optimization - low application volume after 30 days");
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Job Performance Score
            </div>
            <Badge className={getHealthBadge(healthScore).color}>
              {getHealthBadge(healthScore).text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isTooNewForAnalysis ? (
            // Show monitoring state for new jobs
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-2">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Collecting Data</p>
              </div>
              <div className="flex-1">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Performance analysis will be available in {24 - jobAgeHours} hours
                  </p>
                  <p className="text-xs text-blue-700">
                    We need at least 24 hours of data to provide meaningful insights and recommendations.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Show normal performance metrics for established jobs
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${getHealthColor(healthScore)}`}>
                  {healthScore}
                </p>
                <p className="text-sm text-gray-600">Overall Score</p>
              </div>
              <div className="flex-1">
                <Progress value={healthScore} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">
                  Based on application velocity, quality, and approval rates
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{isTooNewForAnalysis ? '-' : velocityScore}</p>
              <p className="text-xs text-gray-600">Velocity Score</p>
              <p className="text-xs text-gray-500">{applicationsPerDay}/day</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{approvalRate}%</p>
              <p className="text-xs text-gray-600">Approval Rate</p>
              <p className="text-xs text-gray-500">{approvedApplications} approved</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{qualityScore}%</p>
              <p className="text-xs text-gray-600">Quality Score</p>
              <p className="text-xs text-gray-500">{avgRating.toFixed(1)} avg rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations - only show for established jobs */}
      {recommendations.length > 0 && !isTooNewForAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5" />
                  <p className="text-sm text-orange-800">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Indicators - only show for established jobs with good performance */}
      {healthScore >= 80 && !isTooNewForAnalysis && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-medium">Great job performance!</p>
                <p className="text-sm text-green-700">
                  Your job is performing excellently across all metrics. Keep up the good work!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encouraging message for new jobs */}
      {isTooNewForAnalysis && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-blue-600">
              <Clock className="w-6 h-6" />
              <div>
                <p className="font-medium">Your job is now live!</p>
                <p className="text-sm text-blue-700">
                  We're monitoring your job's performance. Check back in 24 hours for detailed analytics and recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
