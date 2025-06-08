import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Calendar, Star, BarChart3, Activity } from "lucide-react";
import { TrendData } from "@/hooks/useHiringAnalytics";

interface TrendsTabProps {
  analytics: {
    trendData: TrendData[];
  };
}

export const TrendsTab = ({ analytics }: TrendsTabProps) => {
  const { trendData } = analytics;

  // Calculate trend indicators
  const last7Days = trendData.slice(-7);
  const prev7Days = trendData.slice(-14, -7);
  
  const recent7DaysAvg = last7Days.reduce((sum, day) => sum + day.applications, 0) / 7;
  const prev7DaysAvg = prev7Days.reduce((sum, day) => sum + day.applications, 0) / 7;
  const applicationsTrend = recent7DaysAvg > prev7DaysAvg;
  const trendsPercentage = prev7DaysAvg > 0 ? ((recent7DaysAvg - prev7DaysAvg) / prev7DaysAvg) * 100 : 0;

  const recentRatingAvg = last7Days.reduce((sum, day) => sum + day.avgRating, 0) / 7;
  const prevRatingAvg = prev7Days.reduce((sum, day) => sum + day.avgRating, 0) / 7;
  const ratingTrend = recentRatingAvg > prevRatingAvg;

  // Calculate peak day
  const peakDay = trendData.reduce((max, day) => day.applications > max.applications ? day : max, trendData[0]);
  const peakDayName = peakDay?.date 
    ? new Date(peakDay.date).toLocaleDateString('en-US', { weekday: 'long' })
    : 'N/A';
  const peakApplications = Math.max(...trendData.map(d => d.applications));

  // Calculate weekly summary
  const weeklyData = [];
  for (let i = 0; i < trendData.length; i += 7) {
    const week = trendData.slice(i, i + 7);
    const weekTotal = week.reduce((sum, day) => sum + day.applications, 0);
    const weekAvgRating = week.reduce((sum, day) => sum + day.avgRating, 0) / week.length;
    weeklyData.push({
      week: `Week ${Math.floor(i / 7) + 1}`,
      applications: weekTotal,
      avgRating: weekAvgRating
    });
  }

  // Get recent daily data for display
  const recentDays = trendData.slice(-7).map(day => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="space-y-6">
      {/* Trend Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">7-Day Application Trend</p>
                <p className="text-2xl font-bold">
                  {recent7DaysAvg.toFixed(1)}/day
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {applicationsTrend ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-xs ${applicationsTrend ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(trendsPercentage).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating Trend</p>
                <p className="text-2xl font-bold">
                  {recentRatingAvg.toFixed(1)}/3.0
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {ratingTrend ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-xs ${ratingTrend ? 'text-green-600' : 'text-red-600'}`}>
                    {ratingTrend ? 'Improving' : 'Declining'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Peak Application Day</p>
                <p className="text-lg font-bold">{peakDayName}</p>
                <p className="text-sm text-gray-600">
                  {peakApplications} applications
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Daily Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Daily Application Volume (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDays.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{day.date}</span>
                  </div>
                  <div>
                    <p className="font-medium">Applications: {day.applications}</p>
                    <p className="text-sm text-gray-600">Rating: {day.avgRating.toFixed(1)}/3.0</p>
                  </div>
                </div>
                <div className="w-24">
                  <Progress 
                    value={Math.min((day.applications / peakApplications) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality and Weekly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Application Quality Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Week Average</span>
                <span className="text-lg font-bold text-yellow-600">{recentRatingAvg.toFixed(1)}/3.0</span>
              </div>
              <Progress value={(recentRatingAvg / 3) * 100} className="h-3" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Previous Week Average</span>
                <span className="text-lg font-bold text-gray-600">{prevRatingAvg.toFixed(1)}/3.0</span>
              </div>
              <Progress value={(prevRatingAvg / 3) * 100} className="h-3" />
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  {ratingTrend ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${ratingTrend ? 'text-green-600' : 'text-red-600'}`}>
                    {ratingTrend ? 'Quality is improving' : 'Quality is declining'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.slice(-4).map((week, index) => (
                <div key={week.week} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{week.week}</p>
                    <p className="text-sm text-gray-600">Avg Rating: {week.avgRating.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{week.applications}</p>
                    <p className="text-sm text-gray-600">applications</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
