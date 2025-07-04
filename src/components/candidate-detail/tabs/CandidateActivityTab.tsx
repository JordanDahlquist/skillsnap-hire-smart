
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Mail, Star } from "lucide-react";
import { getTimeAgo } from "@/utils/dateUtils";
import { Application } from "@/types";

interface CandidateActivityTabProps {
  application: Application;
}

export const CandidateActivityTab = ({ application }: CandidateActivityTabProps) => {
  // Create timeline events from application data
  const timelineEvents = [
    {
      id: 'applied',
      type: 'application',
      title: 'Application Submitted',
      description: 'Candidate submitted their application',
      timestamp: application.created_at,
      icon: User,
    },
    ...(application.manual_rating ? [{
      id: 'rated',
      type: 'rating',
      title: 'Manual Rating Added',
      description: `Rated ${application.manual_rating} star${application.manual_rating !== 1 ? 's' : ''}`,
      timestamp: application.updated_at,
      icon: Star,
    }] : []),
    ...(application.status === 'rejected' && application.rejection_reason ? [{
      id: 'rejected',
      type: 'status',
      title: 'Application Rejected',
      description: application.rejection_reason,
      timestamp: application.updated_at,
      icon: User,
    }] : []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="text-left">Application Timeline</CardTitle>
          <p className="text-sm text-muted-foreground text-left">
            Activity history for this candidate
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="flex gap-3 relative">
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute left-4 top-8 w-px h-full bg-border" />
                  )}
                  
                  <div className="flex-shrink-0 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground text-left">
                        {event.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(event.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground text-left">
                      {event.description}
                    </p>
                    
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            {timelineEvents.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activity recorded yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
