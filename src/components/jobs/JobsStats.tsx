
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
    <div className="px-8 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card 
            className={`group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 ${
              onNeedsAttentionClick ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${needsAttentionActive ? 'ring-1 ring-orange-400 shadow-orange-50' : ''}`}
            onClick={onNeedsAttentionClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <CardContent className="relative p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Bell className="w-3 h-3 text-orange-600" />
                </div>
                {stats.jobsNeedingAttention > 0 && (
                  <Badge className="bg-orange-500 text-white border-0 px-1 py-0 text-[10px] font-medium h-4">
                    !
                  </Badge>
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Needs Attention
                </p>
                <p className="text-lg font-bold text-orange-600 leading-none">
                  {stats.jobsNeedingAttention}
                </p>
                {needsAttentionActive && (
                  <Badge className="bg-orange-200 text-orange-800 border-0 text-[9px] px-1 py-0 h-3">
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            <CardContent className="relative p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-[#007af6]" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Active Jobs
                </p>
                <p className="text-lg font-bold text-[#007af6] leading-none">
                  {stats.activeJobs}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            <CardContent className="relative p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-3 h-3 text-purple-600" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Total Applications
                </p>
                <p className="text-lg font-bold text-purple-600 leading-none">
                  {stats.totalApplications}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            <CardContent className="relative p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-green-600" />
                </div>
                {stats.applicationsThisWeek > 0 && (
                  <Badge className="bg-green-500 text-white border-0 px-1 py-0 text-[10px] font-medium h-4">
                    +
                  </Badge>
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  This Week
                </p>
                <p className="text-lg font-bold text-green-600 leading-none">
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
