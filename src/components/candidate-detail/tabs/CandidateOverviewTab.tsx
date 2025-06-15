
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Globe, Linkedin, Github, Calendar, Star } from "lucide-react";
import { renderManualRating, renderAIRating } from "@/components/dashboard/utils/ratingUtils";
import { getTimeAgo } from "@/utils/dateUtils";
import { Application, Job } from "@/types";

interface CandidateOverviewTabProps {
  application: Application;
  job: Job;
  onApplicationUpdate: () => void;
}

export const CandidateOverviewTab = ({ 
  application, 
  job, 
  onApplicationUpdate 
}: CandidateOverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contact Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground text-left">Email</label>
              <p className="text-foreground text-left">{application.email}</p>
            </div>
            
            {application.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground text-left">Phone</label>
                  <p className="text-foreground text-left">{application.phone}</p>
                </div>
              </div>
            )}
            
            {application.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground text-left">Location</label>
                  <p className="text-foreground text-left">{application.location}</p>
                </div>
              </div>
            )}

            {application.available_start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground text-left">Available Start Date</label>
                  <p className="text-foreground text-left">
                    {new Date(application.available_start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="pt-4 border-t border-border">
            <label className="text-sm font-medium text-muted-foreground mb-3 block text-left">Professional Links</label>
            <div className="space-y-2">
              {application.portfolio_url && (
                <a 
                  href={application.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-left"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              )}
              
              {application.linkedin_url && (
                <a 
                  href={application.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-left"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Profile
                </a>
              )}
              
              {application.github_url && (
                <a 
                  href={application.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-left"
                >
                  <Github className="w-4 h-4" />
                  GitHub Profile
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-left">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground text-left">Applied</label>
            <p className="text-foreground text-left">{getTimeAgo(application.created_at)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground text-left">Current Stage</label>
            <div className="mt-1">
              <Badge variant="outline">
                {application.pipeline_stage || 'Applied'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground text-left">Your Rating</label>
              <div className="flex gap-0.5 mt-1">
                {renderManualRating(application.manual_rating)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground text-left">AI Rating</label>
              <div className="flex gap-0.5 mt-1">
                {renderAIRating(application.ai_rating)}
              </div>
            </div>
          </div>

          {application.ai_summary && (
            <div>
              <label className="text-sm font-medium text-muted-foreground text-left">AI Summary</label>
              <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-foreground text-sm text-left">{application.ai_summary}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cover Letter */}
      {application.cover_letter && (
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-left">Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-foreground whitespace-pre-wrap text-left">{application.cover_letter}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
