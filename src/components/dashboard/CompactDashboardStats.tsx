
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  Award,
  TrendingUp
} from "lucide-react";

interface Application {
  status: string;
  ai_rating: number | null;
  created_at: string;
}

interface Job {
  created_at: string;
}

interface CompactDashboardStatsProps {
  applications: Application[];
  job: Job;
}

export const CompactDashboardStats = ({ applications, job }: CompactDashboardStatsProps) => {
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  
  // Calculate applications this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const applicationsThisWeek = applications.filter(
    app => new Date(app.created_at) >= oneWeekAgo
  ).length;

  // Quality score based on AI ratings
  const highQualityApps = applications.filter(app => (app.ai_rating || 0) >= 4).length;
  const qualityScore = applications.length > 0 ? Math.round((highQualityApps / applications.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Applications</p>
              <p className="text-xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Pending Review</p>
              <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Award className="w-6 h-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Quality Score</p>
              <p className="text-xl font-bold text-gray-900">{qualityScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">This Week</p>
              <p className="text-xl font-bold text-gray-900">{applicationsThisWeek}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
