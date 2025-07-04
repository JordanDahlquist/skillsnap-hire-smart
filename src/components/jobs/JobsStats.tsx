
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, TrendingUp, BarChart3 } from "lucide-react";
import { JobStats } from "@/hooks/useJobStats";
import { useThemeContext } from "@/contexts/ThemeContext";

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
  const { currentTheme } = useThemeContext();
  
  // Theme-aware colors
  const labelTextColor = currentTheme === 'black' ? 'text-gray-200' : 'text-gray-600';
  const orangeNumberColor = currentTheme === 'black' ? 'text-orange-300' : 'text-orange-600';
  const blueNumberColor = currentTheme === 'black' ? 'text-blue-300' : 'text-[#007af6]';
  const purpleNumberColor = currentTheme === 'black' ? 'text-purple-300' : 'text-purple-600';
  const greenNumberColor = currentTheme === 'black' ? 'text-green-300' : 'text-green-600';

  return (
    <div className="px-8 pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Card 
            className={`group relative overflow-hidden border-0 glass-card-neon-amber ${
              onNeedsAttentionClick ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${needsAttentionActive ? 'ring-1 ring-orange-400 shadow-orange-50' : ''}`}
            onClick={onNeedsAttentionClick}
          >
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 ${
                  currentTheme === 'black' ? 'bg-orange-900/50' : 'bg-orange-100'
                }`}>
                  <Bell className={`w-4 h-4 ${currentTheme === 'black' ? 'text-orange-300' : 'text-orange-600'}`} />
                </div>
                {stats.jobsNeedingAttention > 0 && (
                  <Badge className="bg-orange-500 text-white border-0 px-1 py-0 text-[9px] font-medium h-3">
                    !
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className={`text-xs font-medium uppercase tracking-wide leading-tight ${labelTextColor}`}>
                  Needs Attention
                </p>
                <p className={`text-lg font-bold leading-none ${orangeNumberColor}`}>
                  {stats.jobsNeedingAttention}
                </p>
                {needsAttentionActive && (
                  <Badge className={`border-0 text-[8px] px-1 py-0 h-2.5 ${
                    currentTheme === 'black' ? 'bg-orange-800 text-orange-200' : 'bg-orange-200 text-orange-800'
                  }`}>
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`group relative overflow-hidden border-0 glass-card-neon-cyan ${
              onActiveJobsClick ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${activeJobsFilterActive ? 'ring-1 ring-blue-400 shadow-blue-50' : ''}`}
            onClick={onActiveJobsClick}
          >
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 ${
                  currentTheme === 'black' ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${currentTheme === 'black' ? 'text-blue-300' : 'text-[#007af6]'}`} />
                </div>
                {activeJobsFilterActive && (
                  <Badge className="bg-blue-500 text-white border-0 px-1 py-0 text-[9px] font-medium h-3">
                    ✓
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className={`text-xs font-medium uppercase tracking-wide leading-tight ${labelTextColor}`}>
                  Active Jobs
                </p>
                <p className={`text-lg font-bold leading-none ${blueNumberColor}`}>
                  {stats.activeJobs}
                </p>
                {activeJobsFilterActive && (
                  <Badge className={`border-0 text-[8px] px-1 py-0 h-2.5 ${
                    currentTheme === 'black' ? 'bg-blue-800 text-blue-200' : 'bg-blue-200 text-blue-800'
                  }`}>
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 glass-card-neon-purple">
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                  currentTheme === 'black' ? 'bg-purple-900/50' : 'bg-purple-100'
                }`}>
                  <Users className={`w-4 h-4 ${currentTheme === 'black' ? 'text-purple-300' : 'text-purple-600'}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className={`text-xs font-medium uppercase tracking-wide leading-tight ${labelTextColor}`}>
                  Total Applications
                </p>
                <p className={`text-lg font-bold leading-none ${purpleNumberColor}`}>
                  {stats.totalApplications}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 glass-card-neon-emerald">
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                  currentTheme === 'black' ? 'bg-green-900/50' : 'bg-green-100'
                }`}>
                  <BarChart3 className={`w-4 h-4 ${currentTheme === 'black' ? 'text-green-300' : 'text-green-600'}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className={`text-xs font-medium uppercase tracking-wide leading-tight ${labelTextColor}`}>
                  Applications This Week
                </p>
                <p className={`text-lg font-bold leading-none ${greenNumberColor}`}>
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
