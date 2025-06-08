import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Star, 
  Clock, 
  ThumbsUp, 
  Eye, 
  TrendingUp, 
  Calendar,
  Target,
  Globe,
  MapPin,
  Award,
  Zap
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

interface EnhancedDashboardStatsProps {
  applications: Application[];
  job: Job;
}

export const EnhancedDashboardStats = ({ applications, job }: EnhancedDashboardStatsProps) => {
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;
  const avgRating = applications.length > 0 
    ? applications.reduce((sum, app) => sum + (app.ai_rating || 0), 0) / applications.length 
    : 0;

  // Calculate applications this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const applicationsThisWeek = applications.filter(
    app => new Date(app.created_at) >= oneWeekAgo
  ).length;

  // Mock data for enhanced metrics (in real app, this would come from analytics)
  const mockViews = 342;
  const responseRate = applications.length > 0 ? Math.round((applications.length / mockViews) * 100) : 0;
  const dailyApplications = applications.length > 0 ? (applications.length / Math.max(1, Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1) : '0';
  
  // Experience level distribution
  const experienceLevels = applications.reduce((acc, app) => {
    const level = app.experience || 'Not specified';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topExperienceLevel = Object.entries(experienceLevels).sort(([,a], [,b]) => b - a)[0];

  // Quality score based on AI ratings (3-star scale)
  const highQualityApps = applications.filter(app => (app.ai_rating || 0) >= 2.5).length;
  const qualityScore = applications.length > 0 ? Math.round((highQualityApps / applications.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Primary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                {applicationsThisWeek > 0 && (
                  <p className="text-xs text-green-600">+{applicationsThisWeek} this week</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{mockViews}</p>
                <p className="text-xs text-blue-600">{responseRate}% response rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Daily Applications</p>
                <p className="text-2xl font-bold text-gray-900">{dailyApplications}</p>
                <p className="text-xs text-green-600">avg per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quality Score</p>
                <p className="text-2xl font-bold text-gray-900">{qualityScore}%</p>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <p className="text-xs text-gray-600 ml-1">{avgRating.toFixed(1)} avg rating</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
              {pendingCount > 5 && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  High Volume
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ThumbsUp className="w-6 h-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-xl font-bold text-gray-900">{approvedCount}</p>
                </div>
              </div>
              {approvedCount > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {Math.round((approvedCount / applications.length) * 100)}% rate
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-6 h-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Top Experience</p>
                  <p className="text-lg font-bold text-gray-900">
                    {topExperienceLevel ? topExperienceLevel[0] : 'N/A'}
                  </p>
                </div>
              </div>
              {topExperienceLevel && (
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  {topExperienceLevel[1]} apps
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-900">{responseRate}%</p>
                <p className="text-xs text-blue-700">Views to applications</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Application Velocity</p>
                <p className="text-2xl font-bold text-green-900">{applicationsThisWeek}</p>
                <p className="text-xs text-green-700">Applications this week</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Quality Applications</p>
                <p className="text-2xl font-bold text-purple-900">{highQualityApps}</p>
                <p className="text-xs text-purple-700">2.5+ star ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
