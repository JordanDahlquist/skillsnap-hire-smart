import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Globe, Linkedin, Github, Calendar, Star, ThumbsDown, RotateCcw, Mail } from "lucide-react";
import { renderManualRating, renderAIRating } from "@/components/dashboard/utils/ratingUtils";
import { getTimeAgo } from "@/utils/dateUtils";
import { toast } from "@/hooks/use-toast";
import { Application, Job } from "@/types";

interface CandidateOverviewTabProps {
  application: Application;
  job: Job;
  onApplicationUpdate: () => void;
  onReject?: () => void;
  onUnreject?: () => void;
  onEmail?: () => void;
  isUpdating?: boolean;
}

export const CandidateOverviewTab = ({ 
  application, 
  job, 
  onApplicationUpdate,
  onReject,
  onUnreject,
  onEmail,
  isUpdating = false
}: CandidateOverviewTabProps) => {
  // Local state to reflect immediate updates
  const [localApplication, setLocalApplication] = useState(application);
  
  useEffect(() => {
    setLocalApplication(application);
  }, [application]);

  const handleCopyEmail = async () => {
    if (localApplication.email) {
      try {
        await navigator.clipboard.writeText(localApplication.email);
        toast({
          description: "Email copied!",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy email",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyPhone = async () => {
    if (localApplication.phone) {
      try {
        await navigator.clipboard.writeText(localApplication.phone);
        toast({
          description: "Phone copied!",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy phone",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenLocation = () => {
    if (localApplication.location) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localApplication.location)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contact Information */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-left">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground text-left block">Email</label>
                <button
                  onClick={handleCopyEmail}
                  className="text-foreground text-left hover:text-primary transition-colors cursor-pointer"
                >
                  {localApplication.email}
                </button>
              </div>
            </div>
            
            {localApplication.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground text-left block">Phone</label>
                  <button
                    onClick={handleCopyPhone}
                    className="text-foreground text-left hover:text-primary transition-colors cursor-pointer"
                  >
                    {localApplication.phone}
                  </button>
                </div>
              </div>
            )}
            
            {localApplication.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground text-left block">Location</label>
                  <button
                    onClick={handleOpenLocation}
                    className="text-foreground text-left hover:text-primary transition-colors cursor-pointer"
                  >
                    {localApplication.location}
                  </button>
                </div>
              </div>
            )}

            {localApplication.available_start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground text-left block">Available Start Date</label>
                  <p className="text-foreground text-left">
                    {new Date(localApplication.available_start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="pt-4 border-t border-border">
            <label className="text-sm font-medium text-muted-foreground mb-3 block text-left">Professional Links</label>
            <div className="space-y-2">
              {localApplication.portfolio_url && (
                <a 
                  href={localApplication.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-left"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              )}
              
              {localApplication.linkedin_url && (
                <a 
                  href={localApplication.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-left"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Profile
                </a>
              )}
              
              {localApplication.github_url && (
                <a 
                  href={localApplication.github_url} 
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

      {/* Application Summary with Actions at Very Top */}
      <Card className="bg-card border border-border">
        <CardContent className="p-0">
          {/* Actions Bar - Prominent at the very top */}
          <div className="bg-muted/20 border-b border-border p-4">
            <div className="flex items-center justify-between">
        <CardTitle>Application Summary</CardTitle>
        {localApplication.status === 'rejected' && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={onUnreject}
              disabled={isUpdating}
              className="border-green-200 text-green-600 hover:bg-green-50 h-9 px-4"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Unreject
            </Button>
          </div>
        )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground text-left block">Applied</label>
              <p className="text-foreground text-left">{getTimeAgo(localApplication.created_at)}</p>
            </div>

            {localApplication.ai_summary && (
              <div>
                <label className="text-sm font-medium text-muted-foreground text-left block">AI Summary</label>
                <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-foreground text-sm text-left">{localApplication.ai_summary}</p>
                </div>
              </div>
            )}

            {isUpdating && (
              <div className="flex items-center gap-2 pt-2">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-muted-foreground">Updating...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter */}
      {localApplication.cover_letter && (
        <Card className="bg-card border border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-left">Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-foreground whitespace-pre-wrap text-left">{localApplication.cover_letter}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
