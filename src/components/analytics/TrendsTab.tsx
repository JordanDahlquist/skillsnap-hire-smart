
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Star } from "lucide-react";
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

  // Format data for charts
  const chartData = trendData.map(day => ({
    ...day,
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

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
                  {recentRatingAvg.toFixed(1)}/5.0
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
                <p className="text-lg font-bold">
                  {trendData.reduce((max, day) => day.applications > max.applications ? day : max, trendData[0])?.date 
                    ? new Date(trendData.reduce((max, day) => day.applications > max.applications ? day : max, trendData[0]).date).toLocaleDateString('en-US', { weekday: 'long' })
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {Math.max(...trendData.map(d => d.applications))} applications
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Applications Trend */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Daily Application Volume (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="applicationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#applicationGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quality and Volume Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Application Quality Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="avgRating" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
