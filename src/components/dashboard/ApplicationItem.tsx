import React, { memo, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Mail, Star, MapPin, Calendar } from "lucide-react";
import { StageSelector } from "./StageSelector";
import { Application } from "@/types";

interface ApplicationItemProps {
  application: Application;
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  getStatusColor: (status: string, manualRating?: number | null) => string;
  getTimeAgo: (dateString: string) => string;
  selectedApplications?: string[];
  onSelectApplications?: (ids: string[]) => void;
  jobId?: string;
}

export const ApplicationItem = memo(({
  application,
  selectedApplication,
  onSelectApplication,
  getStatusColor,
  getTimeAgo,
  selectedApplications = [],
  onSelectApplications,
  jobId
}: ApplicationItemProps) => {
  const isSelected = selectedApplication?.id === application.id;
  const isChecked = selectedApplications.includes(application.id);

  const handleApplicationClick = useCallback(() => {
    onSelectApplication(application);
  }, [application, onSelectApplication]);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    if (!onSelectApplications) return;
    
    if (checked) {
      onSelectApplications([...selectedApplications, application.id]);
    } else {
      onSelectApplications(selectedApplications.filter(id => id !== application.id));
    }
  }, [application.id, selectedApplications, onSelectApplications]);

  const handleStageChange = useCallback((applicationId: string, newStage: string) => {
    // This will trigger the parent to refresh data
  }, []);

  const handleEmailClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`mailto:${application.email}`, '_blank');
  }, [application.email]);

  const getRatingDisplay = () => {
    const rating = application.manual_rating || application.ai_rating;
    if (!rating) return null;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 lg:w-4 lg:h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-xs lg:text-sm text-muted-foreground ml-1">
          ({rating}/3)
        </span>
      </div>
    );
  };

  return (
    <Card 
      className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-md border ${
        isSelected 
          ? 'ring-2 ring-primary border-primary/50 bg-primary/5' 
          : 'border-border hover:border-border/80'
      }`}
      onClick={handleApplicationClick}
    >
      <CardContent className="p-3 lg:p-4">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <div className="flex items-center pt-1">
              <Checkbox
                checked={isChecked}
                onCheckedChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {application.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {application.email}
                  </p>
                </div>
                <Badge 
                  className={`${getStatusColor(application.status, application.manual_rating)} text-xs flex-shrink-0`}
                >
                  {application.status}
                </Badge>
              </div>

              {/* Rating and Time */}
              <div className="flex items-center justify-between gap-2 mb-3">
                {getRatingDisplay()}
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {getTimeAgo(application.created_at)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailClick}
                  className="h-7 px-2 text-xs"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                
                {jobId && (
                  <div className="flex-1 min-w-0">
                    <StageSelector
                      jobId={jobId}
                      currentStage={application.pipeline_stage}
                      applicationId={application.id}
                      onStageChange={handleStageChange}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Keep existing */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Checkbox
                checked={isChecked}
                onCheckedChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {application.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {application.email}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {getRatingDisplay()}
                  <Badge className={getStatusColor(application.status, application.manual_rating)}>
                    {application.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {application.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-[120px]">{application.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{getTimeAgo(application.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEmailClick}
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  
                  {jobId && (
                    <StageSelector
                      jobId={jobId}
                      currentStage={application.pipeline_stage}
                      applicationId={application.id}
                      onStageChange={handleStageChange}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ApplicationItem.displayName = 'ApplicationItem';
