
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Bell, Users, TrendingUp, BarChart3 } from "lucide-react";
import { JobStats } from "@/hooks/useJobStats";

interface JobsStatsProps {
  stats: JobStats;
  onNeedsAttentionClick?: () => void;
  needsAttentionActive?: boolean;
}

export const JobsStats = ({ stats, onNeedsAttentionClick, needsAttentionActive }: JobsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card 
        className={`border-0 shadow-sm bg-white/80 backdrop-blur-sm transition-all duration-200 ${
          onNeedsAttentionClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
        } ${needsAttentionActive ? 'ring-2 ring-orange-500 bg-orange-50/80' : ''}`}
        onClick={onNeedsAttentionClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jobs Needing Attention</p>
              <p className="text-2xl font-bold text-orange-600">{stats.jobsNeedingAttention}</p>
              {stats.jobsNeedingAttention > 0 && (
                <Badge className="mt-1 bg-orange-100 text-orange-600">
                  Needs Review
                </Badge>
              )}
              {needsAttentionActive && (
                <Badge className="mt-1 bg-orange-200 text-orange-700">
                  Filtered
                </Badge>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-[#007af6]">{stats.activeJobs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#007af6]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-[#007af6]">{stats.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-[#007af6]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications This Week</p>
              <p className="text-2xl font-bold text-[#007af6]">{stats.applicationsThisWeek}</p>
              {stats.applicationsThisWeek > 0 && (
                <Badge className="mt-1 bg-blue-100 text-[#007af6]">
                  Applications this week
                </Badge>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#007af6]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
