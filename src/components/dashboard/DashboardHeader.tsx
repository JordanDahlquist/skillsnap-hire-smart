import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, ExternalLink, Users, Calendar, MapPin, DollarSign } from "lucide-react";
import { Job, Application } from "@/types";
import { getTimeAgo } from "@/utils/dateUtils";
import { useDashboardHeaderActions } from "@/hooks/useDashboardHeaderActions";
import { DashboardHeaderActions } from "./components/DashboardHeaderActions";
import { JobEditModal } from "../JobEditModal";

interface DashboardHeaderProps {
  job: Job;
  applications: Application[];
  onJobUpdate: () => void;
}

export const DashboardHeader = memo(({ job, applications, onJobUpdate }: DashboardHeaderProps) => {
  const {
    isUpdating,
    isRefreshingAI,
    isEditModalOpen,
    setIsEditModalOpen,
    handleStatusChange,
    handleShareJob,
    handleExportApplications,
    handleEditJob,
    handleArchiveJob,
    handleUnarchiveJob,
    handleRefreshAI
  } = useDashboardHeaderActions(job, applications, onJobUpdate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <>
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-4">
            {/* Mobile Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShareJob}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <h1 className="text-xl font-bold text-foreground leading-tight">
                {job.title}
              </h1>
              
              <div className="text-sm text-muted-foreground">
                Created {getTimeAgo(job.created_at)}
              </div>
            </div>

            {/* Mobile Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{applications.length}</div>
                  <div className="text-xs text-muted-foreground">Applications</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-foreground">
                    {applications.filter(app => app.ai_rating && app.ai_rating >= 2).length}
                  </div>
                  <div className="text-xs text-muted-foreground">High Rated</div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Job Details */}
            <Card className="bg-card/30 backdrop-blur-sm border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {job.location_type && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground capitalize">
                        {job.location_type.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {job.employment_type && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground capitalize">
                        {job.employment_type.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {job.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{job.budget}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mobile Actions */}
            <div className="w-full">
              <DashboardHeaderActions
                job={job}
                isUpdating={isUpdating}
                onStatusChange={handleStatusChange}
                onShareJob={handleShareJob}
                onEditJob={handleEditJob}
                onExportApplications={handleExportApplications}
                onArchiveJob={handleArchiveJob}
                onUnarchiveJob={handleUnarchiveJob}
                onRefreshAI={handleRefreshAI}
                isRefreshingAI={isRefreshingAI}
              />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-foreground truncate">
                    {job.title}
                  </h1>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  {job.department && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{job.department}</span>
                    </div>
                  )}
                  {job.location_type && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">
                        {job.location_type.replace('_', ' ')}
                        {job.location && ` • ${job.location}`}
                      </span>
                    </div>
                  )}
                  {job.employment_type && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="capitalize">{job.employment_type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {job.salary_range && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>Created {getTimeAgo(job.created_at)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">{applications.length}</div>
                      <div className="text-sm text-muted-foreground">Total Applications</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {applications.filter(app => app.ai_rating && app.ai_rating >= 2).length}
                      </div>
                      <div className="text-sm text-muted-foreground">High Rated (2+ stars)</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {applications.filter(app => app.status === 'pending').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending Review</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="ml-6 flex-shrink-0">
                <DashboardHeaderActions
                  job={job}
                  isUpdating={isUpdating}
                  onStatusChange={handleStatusChange}
                  onShareJob={handleShareJob}
                  onEditJob={handleEditJob}
                  onExportApplications={handleExportApplications}
                  onArchiveJob={handleArchiveJob}
                  onUnarchiveJob={handleUnarchiveJob}
                  onRefreshAI={handleRefreshAI}
                  isRefreshingAI={isRefreshingAI}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <JobEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        job={job}
        onJobUpdate={onJobUpdate}
      />
    </>
  );
});

DashboardHeader.displayName = 'DashboardHeader';
