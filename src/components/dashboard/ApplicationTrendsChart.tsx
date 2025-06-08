
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Users, Star } from "lucide-react";

interface Application {
  created_at: string;
  ai_rating: number | null;
}

interface ApplicationTrendsChartProps {
  applications: Application[];
}

export const ApplicationTrendsChart = ({ applications }: ApplicationTrendsChartProps) => {
  // Calculate weekly data
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

  // Calculate average rating
  const ratedApplications = applications.filter(app => app.ai_rating !== null);
  const avgRating = ratedApplications.length > 0 
    ? (ratedApplications.reduce((sum, app) => sum + (app.ai_rating || 0), 0) / ratedApplications.length).toFixed(1)
    : '0.0';

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
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Application Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* This Week Stats */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{thisWeek.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Growth</p>
                <p className={`text-2xl font-bold ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth}%
                </p>
              </div>
            </div>
          </div>

          {/* Rating Stats */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{avgRating}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Last Week: {lastWeek.length} applications</span>
            <span className="text-gray-600">Rated Applications: {ratedApplications.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
