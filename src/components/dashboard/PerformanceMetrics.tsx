
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Globe
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
  const applicationsPerDay = jobAge > 0 ? (totalApplications / jobAge).toFixed(1) : totalApplications.toString();
  
  // Mock performance benchmarks (in real app, these would come from analytics)
  const benchmarkAppsPerDay = 3.2;
  const benchmarkApprovalRate = 25;
  const benchmarkQualityScore = 65;

  // Calculate performance scores
  const velocityScore = jobAge > 0 ? Math.min(100, Math.round((parseFloat(applicationsPerDay) / benchmarkAppsPerDay) * 100)) : 0;
  const approvalRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0;
  const qualityScore = totalApplications > 0 ? Math.round((highQualityApps / totalApplications) * 100) : 0;

  // Overall job health score
  const healthScore = Math.round((velocityScore + Math.min(100, (approvalRate / benchmarkApprovalRate) * 100) + Math.min(100, (qualityScore / benchmarkQualityScore) * 100)) / 3);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { text: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 60) return { text: "Good", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Needs Attention", color: "bg-red-100 text-red-800" };
  };

  const recommendations = [];
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

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold">{velocityScore}</p>
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

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Time to First App</p>
                <p className="text-lg font-bold">
                  {totalApplications > 0 ? '< 24h' : 'Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Days</p>
                <p className="text-lg font-bold">{jobAge} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Top Rating</p>
                <p className="text-lg font-bold">
                  {Math.max(...applications.map(app => app.ai_rating || 0), 0).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Reach</p>
                <p className="text-lg font-bold">Global</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
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

      {/* Success Indicators */}
      {healthScore >= 80 && (
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
    </div>
  );
};
