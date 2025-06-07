
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, TrendingUp, BarChart3 } from "lucide-react";
import { JobStats } from "@/hooks/useJobStats";

interface JobsStatsProps {
  stats: JobStats;
  onNeedsAttentionClick?: () => void;
  needsAttentionActive?: boolean;
}

export const JobsStats = ({ stats, onNeedsAttentionClick, needsAttentionActive }: JobsStatsProps) => {
  return (
    <div className="px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className={`group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
              onNeedsAttentionClick ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : ''
            } ${needsAttentionActive ? 'ring-2 ring-orange-500 shadow-orange-100' : ''}`}
            onClick={onNeedsAttentionClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-7 h-7 text-orange-600" />
                </div>
                {stats.jobsNeedingAttention > 0 && (
                  <Badge className="bg-orange-500 text-white border-0 px-3 py-1 text-xs font-semibold">
                    Urgent
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Needs Attention
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.jobsNeedingAttention}
                </p>
                {needsAttentionActive && (
                  <Badge className="bg-orange-200 text-orange-800 border-0">
                    Filtered
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-[#007af6]" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Active Jobs
                </p>
                <p className="text-3xl font-bold text-[#007af6]">
                  {stats.activeJobs}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Total Applications
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalApplications}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-green-600" />
                </div>
                {stats.applicationsThisWeek > 0 && (
                  <Badge className="bg-green-500 text-white border-0 px-3 py-1 text-xs font-semibold">
                    Active
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  This Week
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.applicationsThisWeek}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
