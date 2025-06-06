
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, Clock, ThumbsUp } from "lucide-react";

interface Application {
  status: string;
  ai_rating: number | null;
}

interface DashboardStatsProps {
  applications: Application[];
}

export const DashboardStats = ({ applications }: DashboardStatsProps) => {
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const avgRating = applications.length > 0 
    ? applications.reduce((sum, app) => sum + (app.ai_rating || 0), 0) / applications.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <ThumbsUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
