
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface Application {
  created_at: string;
  ai_rating: number | null;
}

interface ApplicationTrendsChartProps {
  applications: Application[];
}

export const ApplicationTrendsChart = ({ applications }: ApplicationTrendsChartProps) => {
  // Group applications by day
  const dailyData = applications.reduce((acc, app) => {
    const date = new Date(app.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, applications: 0, totalRating: 0, count: 0 };
    }
    acc[date].applications += 1;
    if (app.ai_rating) {
      acc[date].totalRating += app.ai_rating;
      acc[date].count += 1;
    }
    return acc;
  }, {} as Record<string, { date: string; applications: number; totalRating: number; count: number }>);

  const chartData = Object.values(dailyData)
    .map(day => ({
      date: day.date,
      applications: day.applications,
      avgRating: day.count > 0 ? (day.totalRating / day.count).toFixed(1) : 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14); // Last 14 days

  // Weekly summary
  const thisWeek = applications.filter(app => {
    const appDate = new Date(app.created_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return appDate >= oneWeekAgo;
  });

  const lastWeek = applications.filter(app => {
    const appDate = new Date(app.created_at);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return appDate >= twoWeeksAgo && appDate < oneWeekAgo;
  });

  const weeklyGrowth = lastWeek.length > 0 
    ? Math.round(((thisWeek.length - lastWeek.length) / lastWeek.length) * 100)
    : thisWeek.length > 0 ? 100 : 0;

  const chartConfig = {
    applications: {
      label: "Applications",
      color: "#8b5cf6",
    },
    avgRating: {
      label: "Average Rating",
      color: "#f59e0b",
    },
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Application Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No application data available yet</p>
            <p className="text-sm">Trends will appear once you receive applications</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Application Trends
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600">This Week</p>
              <p className="font-bold text-lg">{thisWeek.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Growth</p>
              <p className={`font-bold text-lg ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth}%
              </p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {chartData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="var(--color-applications)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-applications)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>More data needed for trend analysis</p>
              <p className="text-sm">Charts will appear with more application data</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
