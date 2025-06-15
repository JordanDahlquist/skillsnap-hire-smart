
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github, 
  FileText,
  Star,
  Calendar
} from "lucide-react";
import { ApplicationTabs } from "./ApplicationTabs";
import { StageSelector } from "./StageSelector";
import { Application, Job } from "@/types";

interface MobileApplicationDetailProps {
  selectedApplication: Application;
  applications: Application[];
  job: Job;
  getStatusColor: (status: string, manualRating?: number | null) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
  onApplicationUpdate: () => void;
}

export const MobileApplicationDetail = memo(({
  selectedApplication,
  applications,
  job,
  getStatusColor,
  getRatingStars,
  getTimeAgo,
  onApplicationUpdate
}: MobileApplicationDetailProps) => {
  const handleStageChange = (applicationId: string, newStage: string) => {
    onApplicationUpdate();
  };

  return (
    <div className="space-y-4">
      {/* Mobile Application Header */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold leading-tight mb-2">
                {selectedApplication.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getStatusColor(selectedApplication.status, selectedApplication.manual_rating)}>
                  {selectedApplication.status}
                </Badge>
                {(selectedApplication.manual_rating || selectedApplication.ai_rating) && (
                  <div className="flex items-center gap-1">
                    {getRatingStars(selectedApplication.manual_rating || selectedApplication.ai_rating)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({selectedApplication.manual_rating || selectedApplication.ai_rating}/3)
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied {getTimeAgo(selectedApplication.created_at)}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          {/* Contact Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={`mailto:${selectedApplication.email}`}
                className="text-blue-600 hover:underline truncate"
              >
                {selectedApplication.email}
              </a>
            </div>
            
            {selectedApplication.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <a 
                  href={`tel:${selectedApplication.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {selectedApplication.phone}
                </a>
              </div>
            )}
            
            {selectedApplication.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{selectedApplication.location}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Links */}
          {(selectedApplication.portfolio || selectedApplication.linkedin_url || selectedApplication.github_url) && (
            <div className="space-y-2">
              {selectedApplication.portfolio && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a 
                    href={selectedApplication.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    Portfolio
                  </a>
                </div>
              )}
              
              {selectedApplication.linkedin_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a 
                    href={selectedApplication.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
              
              {selectedApplication.github_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Github className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a 
                    href={selectedApplication.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    GitHub
                  </a>
                </div>
              )}
            </div>
          )}

          {(selectedApplication.portfolio || selectedApplication.linkedin_url || selectedApplication.github_url) && <Separator />}

          {/* Stage Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pipeline Stage</label>
            <StageSelector
              jobId={job.id}
              currentStage={selectedApplication.pipeline_stage}
              applicationId={selectedApplication.id}
              onStageChange={handleStageChange}
              size="sm"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => window.open(`mailto:${selectedApplication.email}`, '_blank')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            {selectedApplication.phone && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => window.open(`tel:${selectedApplication.phone}`, '_blank')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Tabs */}
      <ApplicationTabs
        application={selectedApplication}
        getStatusColor={getStatusColor}
        getRatingStars={getRatingStars}
        getTimeAgo={getTimeAgo}
      />
    </div>
  );
});

MobileApplicationDetail.displayName = 'MobileApplicationDetail';
