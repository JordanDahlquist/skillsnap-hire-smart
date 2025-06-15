import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3,
  Users,
  Star,
  CheckCircle,
  Clock
} from "lucide-react";
import { HiringMetrics, TrendData, JobPerformance } from "@/hooks/useHiringAnalytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TrendsTabProps {
  analytics: {
    metrics: HiringMetrics;
    trendData: TrendData[];
    jobPerformanceData: JobPerformance[];
  };
}

export const TrendsTab = ({ analytics }: TrendsTabProps) => {
  const { metrics, trendData, jobPerformanceData } = analytics;

  // Get last 14 days for trend analysis
  const recentTrends = trendData.slice(-14);
  
  // Calculate trend metrics
  const currentWeekApps = recentTrends.slice(-7).reduce((sum, day) => sum + day.applications, 0);
  const previousWeekApps = recentTrends.slice(-14, -7).reduce((sum, day) => sum + day.applications, 0);
  const weekOverWeekChange = previousWeekApps > 0 ? ((currentWeekApps - previousWeekApps) / previousWeekApps) * 100 : 0;

  const currentWeekHired = recentTrends.slice(-7).reduce((sum, day) => sum + day.hired, 0);
  const previousWeekHired = recentTrends.slice(-14, -7).reduce((sum, day) => sum + day.hired, 0);
  const hiredTrend = previousWeekHired > 0 ? ((currentWeekHired - previousWeekHired) / previousWeekHired) * 100 : 0;

  const avgRatingThisWeek = recentTrends.slice(-7).reduce((sum, day) => sum + day.avgRating, 0) / 7;
  const avgRatingLastWeek = recentTrends.slice(-14, -7).reduce((sum, day) => sum + day.avgRating, 0) / 7;
  const ratingTrend = avgRatingLastWeek > 0 ? ((avgRatingThisWeek - avgRatingLastWeek) / avgRatingLastWeek) * 100 : 0;

  // Top performing jobs by hired rate
  const topJobs = jobPerformanceData
    .filter(job => job.applications >= 3)
    .sort((a, b) => b.hiredRate - a.hiredRate)
    .slice(0, 5);

  const formatChartData = (data: TrendData[]) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: item.applications,
      avgRating: item.avgRating,
      hired: item.hired,
      hiredRate: item.applications > 0 ? (item.hired / item.applications) * 100 : 0
    }));
  };

  const chartData = formatChartData(recentTrends);

  const trendMetrics = [
    {
      title: "Applications",
      current: currentWeekApps,
      change: weekOverWeekChange,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Hired",
      current: currentWeekHired,
      change: hiredTrend,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Avg Rating",
      current: avgRatingThisWeek,
      change: ratingTrend,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      format: "decimal"
    },
    {
      title: "Hired Rate",
      current: currentWeekApps > 0 ? (currentWeekHired / currentWeekApps) * 100 : 0,
      change: 0, // Could calculate if needed
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      format: "percentage"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Weekly Trends Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            <Calendar className="w-5 h-5 text-blue-600" />
            Weekly Trends (Last 7 vs Previous 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              const isPositive = metric.change >= 0;
              
              return (
                <div key={index} className={`p-4 rounded-lg ${metric.bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className={`w-5 h-5 ${metric.color}`} />
                    <div className="flex items-center gap-1">
                      {metric.change !== 0 && (
                        <>
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? '+' : ''}{metric.change.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.format === 'decimal' ? metric.current.toFixed(1) : 
                     metric.format === 'percentage' ? `${metric.current.toFixed(1)}%` : 
                     Math.round(metric.current)}
                  </div>
                  <div className="text-sm text-gray-600 text-left">{metric.title}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-left">Applications Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality & Hired Rate Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-left">Quality & Hired Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgRating" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  name="Avg Rating"
                />
                <Line 
                  type="monotone" 
                  dataKey="hiredRate" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Hired Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Jobs */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Top Performing Jobs by Hired Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topJobs.length > 0 ? (
            <div className="space-y-4">
              {topJobs.map((job, index) => (
                <div key={job.jobId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-left">{job.jobTitle}</h4>
                      <p className="text-sm text-gray-600 text-left">
                        {job.applications} applications • {job.avgRating.toFixed(1)} avg rating
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {job.hiredRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">hired rate</div>
                  </div>
                </div>
              ))}
              
              {/* Performance Insights */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 text-left">Performance Insights</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="text-left">• Your best performing job has a {topJobs[0]?.hiredRate.toFixed(1)}% hired rate</p>
                  <p className="text-left">• Average hired rate across top jobs: {(topJobs.reduce((sum, job) => sum + job.hiredRate, 0) / topJobs.length).toFixed(1)}%</p>
                  <p className="text-left">• Consider replicating successful job posting patterns from your top performers</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Not enough data yet for job performance analysis</p>
              <p className="text-sm text-gray-400 mt-1">Jobs need at least 3 applications to appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.applicationsThisMonth}</div>
              <div className="text-sm text-gray-600">Applications This Month</div>
              <div className="text-xs text-gray-500 mt-1 text-left">
                {metrics.applicationsThisMonth > 50 ? 'Strong pipeline' : 'Building momentum'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {metrics.hiredRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Hired Rate</div>
              <div className="text-xs text-gray-500 mt-1 text-left">
                {metrics.hiredRate >= 2 ? 'Above industry average' : 'Room for improvement'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Quality Score</div>
              <div className="text-xs text-gray-500 mt-1 text-left">
                {metrics.avgRating >= 2.0 ? 'High quality candidates' : 'Consider refining requirements'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
