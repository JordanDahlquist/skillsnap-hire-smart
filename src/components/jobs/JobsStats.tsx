
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
    <div className="px-8 pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Card 
            className={`group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 ${
              onNeedsAttentionClick ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${needsAttentionActive ? 'ring-1 ring-orange-400 shadow-orange-50' : ''}`}
            onClick={onNeedsAttentionClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <CardContent className="relative p-2">
              <div className="flex items-start justify-between mb-1">
                <div className="w-4 h-4 bg-orange-100 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Bell className="w-2.5 h-2.5 text-orange-600" />
                </div>
                {stats.jobsNeedingAttention > 0 && (
                  <Badge className="bg-orange-500 text-white border-0 px-1 py-0 text-[9px] font-medium h-3">
                    !
                  </Badge>
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Needs Attention
                </p>
                <p className="text-sm font-bold text-orange-600 leading-none">
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

          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            <CardContent className="relative p-2">
              <div className="flex items-start justify-between mb-1">
                <div className="w-4 h-4 bg-blue-100 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-2.5 h-2.5 text-[#007af6]" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Active Jobs
                </p>
                <p className="text-sm font-bold text-[#007af6] leading-none">
                  {stats.activeJobs}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            <CardContent className="relative p-2">
              <div className="flex items-start justify-between mb-1">
                <div className="w-4 h-4 bg-purple-100 rounded-md flex items-center justify-center">
                  <Users className="w-2.5 h-2.5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Total Applications
                </p>
                <p className="text-sm font-bold text-purple-600 leading-none">
                  {stats.totalApplications}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            <CardContent className="relative p-2">
              <div className="flex items-start justify-between mb-1">
                <div className="w-4 h-4 bg-green-100 rounded-md flex items-center justify-center">
                  <BarChart3 className="w-2.5 h-2.5 text-green-600" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                  Applications This Week
                </p>
                <p className="text-sm font-bold text-green-600 leading-none">
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
