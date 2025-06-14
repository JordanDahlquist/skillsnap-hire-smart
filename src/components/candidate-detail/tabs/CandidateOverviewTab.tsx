
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
          <CardTitle className="flex items-center gap-2">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{application.email}</p>
            </div>
            
            {application.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-foreground">{application.phone}</p>
                </div>
              </div>
            )}
            
            {application.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="text-foreground">{application.location}</p>
                </div>
              </div>
            )}

            {application.available_start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Available Start Date</label>
                  <p className="text-foreground">
                    {new Date(application.available_start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="pt-4 border-t border-border">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Professional Links</label>
            <div className="space-y-2">
              {application.portfolio_url && (
                <a 
                  href={application.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
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
                  className="flex items-center gap-2 text-blue-600 hover:underline"
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
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  GitHub Profile
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Summary - Compact Layout */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle>Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Applied</label>
            <p className="text-foreground">{getTimeAgo(application.created_at)}</p>
          </div>

          {/* Compact row with Stage and Ratings */}
          <div className="flex items-center justify-between gap-4 py-2 bg-muted/20 rounded-lg px-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Stage:</label>
              <Badge variant="outline" className="text-xs">
                {application.pipeline_stage || 'Applied'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">You:</label>
                <div className="flex gap-0.5">
                  {renderManualRating(application.manual_rating)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">AI:</label>
                <div className="flex gap-0.5">
                  {renderAIRating(application.ai_rating)}
                </div>
              </div>
            </div>
          </div>

          {application.ai_summary && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">AI Summary</label>
              <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-foreground text-sm">{application.ai_summary}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cover Letter */}
      {application.cover_letter && (
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-foreground whitespace-pre-wrap">{application.cover_letter}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
