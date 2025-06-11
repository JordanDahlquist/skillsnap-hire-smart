
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, TrendingUp, BarChart3 } from "lucide-react";
import { JobStats } from "@/hooks/useJobStats";

interface JobsStatsProps {
  stats: JobStats;
  onNeedsAttentionClick?: () => void;
  needsAttentionActive?: boolean;
  onActiveJobsClick?: () => void;
  activeJobsFilterActive?: boolean;
}

export const JobsStats = ({ 
  stats, 
  onNeedsAttentionClick, 
  needsAttentionActive,
  onActiveJobsClick,
  activeJobsFilterActive
}: JobsStatsProps) => {
  return (
    <div className="px-6 sm:px-8 lg:px-12 pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Card 
            className={`group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 ${
              onNeedsAttentionClick ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${needsAttentionActive ? 'ring-1 ring-orange-400 shadow-orange-50' : ''}`}
            onClick={onNeedsAttentionClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-50 group-hover:opacity-70 transition-opacity duration-200" />
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <Bell className="w-4 h-4 text-orange-600" />
                </div>
                {stats.jobsNeedingAttention > 0 && (
                  <Badge className="bg-orange-500 text-white border-0 px-1 py-0 text-[9px] font-medium h-3">
                    !
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Needs Attention
                </p>
                <p className="text-lg font-bold text-orange-600 leading-none">
                  {stats.jobsNeedingAttention}
                </p>
                {needsAttentionActive && (
                  <Badge className="bg-orange-200 text-orange-800 border-0 text-[8px] px-1 py-0 h-2.5">
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 ${
              onActiveJobsClick ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${activeJobsFilterActive ? 'ring-1 ring-blue-400 shadow-blue-50' : ''}`}
            onClick={onActiveJobsClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50 group-hover:opacity-70 transition-opacity duration-200" />
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <TrendingUp className="w-4 h-4 text-[#007af6]" />
                </div>
                {activeJobsFilterActive && (
                  <Badge className="bg-blue-500 text-white border-0 px-1 py-0 text-[9px] font-medium h-3">
                    ✓
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Active Jobs
                </p>
                <p className="text-lg font-bold text-[#007af6] leading-none">
                  {stats.activeJobs}
                </p>
                {activeJobsFilterActive && (
                  <Badge className="bg-blue-200 text-blue-800 border-0 text-[8px] px-1 py-0 h-2.5">
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-50" />
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Total Applications
                </p>
                <p className="text-lg font-bold text-purple-600 leading-none">
                  {stats.totalApplications}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50" />
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Applications This Week
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
