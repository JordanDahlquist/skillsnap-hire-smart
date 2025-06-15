
import { useState, memo, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Calendar, 
  Building2, 
  Users, 
  TrendingUp,
  MoreVertical,
  ExternalLink,
  BarChart3,
  Bell,
  Star
} from "lucide-react";
import { Job } from "@/types";
import { MobileJobCardActions } from "./MobileJobCardActions";

interface MobileJobCardProps {
  job: Job;
  onJobUpdate: () => void;
  getTimeAgo: (dateString: string) => string;
  isSelected?: boolean;
  onJobSelection?: (checked: boolean) => void;
  applicationsCount: number;
  needsAttention: boolean;
  onStatusChange: (newStatus: string) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  isUpdating: boolean;
}

export const MobileJobCard = memo(({ 
  job, 
  onJobUpdate, 
  getTimeAgo,
  isSelected = false,
  onJobSelection,
  applicationsCount,
  needsAttention,
  onStatusChange,
  onEdit,
  onDuplicate,
  onArchive,
  isUpdating
}: MobileJobCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const handleJobSelection = useCallback((checked: boolean) => {
    onJobSelection?.(checked);
  }, [onJobSelection]);

  const handleManageClick = useCallback(() => {
    // Navigate to job dashboard
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getLocationDisplay = () => {
    const { location_type, country, state, region, city } = job;
    
    if (location_type === 'remote') {
      return country ? `Remote (${country})` : 'Remote';
    }
    
    if (country === 'United States' && state) {
      const parts = [city, state, region].filter(Boolean);
      return parts.join(', ');
    }
    
    if (country) {
      const parts = [city, country].filter(Boolean);
      return parts.join(', ');
    }
    
    return location_type ? location_type.charAt(0).toUpperCase() + location_type.slice(1) : 'Not specified';
  };

  return (
    <Card className="w-full bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {onJobSelection && (
              <div className="flex items-start pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleJobSelection}
                  className="h-5 w-5"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link 
                to={`/jobs/${job.id}`}
                className="block"
              >
                <h3 className="text-lg font-semibold text-foreground truncate mb-1 hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
              </Link>
              {job.company_name && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{job.company_name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-2 flex-shrink-0">
            <Badge className={`text-xs ${getStatusColor(job.status)}`}>
              {job.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 mb-3">
          {job.needsReview && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">
              <Star className="w-3 h-3" />
              <span>Needs review</span>
            </div>
          )}
          {needsAttention && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-medium">
              <Bell className="w-3 h-3" />
              <span>Needs attention</span>
            </div>
          )}
          {applicationsCount > 10 && !needsAttention && (
            <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
              High Interest
            </Badge>
          )}
        </div>

        {/* Key Metrics Row */}
        <div className="flex items-center justify-between mb-3 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{applicationsCount}</div>
            <div className="text-xs text-muted-foreground">Applications</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{job.view_count || 0}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {Math.floor(Math.random() * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Response</div>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{getLocationDisplay()}</span>
            <span className="text-muted-foreground">•</span>
            <span className="capitalize">{job.employment_type?.replace('_', ' ') || 'Not specified'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Created {getTimeAgo(job.created_at)}</span>
            {job.budget && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-green-600 font-medium">{job.budget}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            asChild 
            className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
          >
            <Link to={`/jobs/${job.id}`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Manage
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="h-11 px-3"
          >
            <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {/* Collapsible Actions */}
        {showActions && (
          <div className="mt-3 pt-3 border-t border-border">
            <MobileJobCardActions
              job={job}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onArchive={onArchive}
              isUpdating={isUpdating}
              onClose={() => setShowActions(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MobileJobCard.displayName = 'MobileJobCard';
