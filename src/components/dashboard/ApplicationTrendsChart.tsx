
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
      <Card className="h-32">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            Application Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-center text-muted-foreground py-2">
            <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-32">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4" />
          Application Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded mb-1 mx-auto">
              <Users className="w-3 h-3 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-lg font-bold text-foreground">{thisWeek.length}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded mb-1 mx-auto">
              <TrendingUp className="w-3 h-3 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Growth</p>
            <p className={`text-lg font-bold ${weeklyGrowth >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth}%
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded mb-1 mx-auto">
              <Star className="w-3 h-3 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
            <p className="text-lg font-bold text-foreground">{avgRating}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded mb-1 mx-auto">
              <Calendar className="w-3 h-3 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{applications.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
