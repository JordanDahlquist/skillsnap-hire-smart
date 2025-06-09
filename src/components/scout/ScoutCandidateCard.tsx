
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Star, Calendar, ExternalLink } from 'lucide-react';
import { getTimeAgo } from '@/utils/dateUtils';

interface ScoutCandidateCardProps {
  candidate: {
    id: string;
    name: string;
    email: string;
    status: string;
    ai_rating?: number;
    manual_rating?: number;
    created_at: string;
    pipeline_stage?: string;
    ai_summary?: string;
    job_id: string;
    jobs?: { title: string };
  };
}

export const ScoutCandidateCard = ({ candidate }: ScoutCandidateCardProps) => {
  const handleClick = () => {
    // Open dashboard in new tab with selected application
    const url = `/dashboard/${candidate.job_id}`;
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      // Store the selected application ID in the new window's session storage
      newWindow.addEventListener('load', () => {
        try {
          newWindow.sessionStorage.setItem('selectedApplicationId', candidate.id);
        } catch (error) {
          console.warn('Could not set session storage for new window:', error);
        }
      });
    }
  };

  const getStatusColor = (status: string, manualRating?: number | null) => {
    if (status === "reviewed" && !manualRating) {
      return "bg-yellow-100 text-yellow-800";
    }
    
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderRating = (rating?: number) => {
    if (!rating) {
      return Array.from({ length: 3 }, (_, i) => (
        <Star key={i} className="w-3 h-3 text-gray-300" />
      ));
    }
    
    return Array.from({ length: 3 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
      />
    ));
  };

  const displayStatus = candidate.status === "reviewed" && !candidate.manual_rating ? "pending" : candidate.status;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow bg-gray-50 border-l-4 border-l-green-500 group"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <h3 className="font-medium text-gray-900 truncate">{candidate.name}</h3>
              <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
              <Mail className="w-3 h-3" />
              <span className="truncate">{candidate.email}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(candidate.status, candidate.manual_rating)}>
                {displayStatus}
              </Badge>
              {candidate.pipeline_stage && (
                <Badge variant="outline" className="text-xs">
                  {candidate.pipeline_stage}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span>Your:</span>
                  <div className="flex gap-0.5">
                    {renderRating(candidate.manual_rating || undefined)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span>AI:</span>
                  <div className="flex gap-0.5">
                    {renderRating(candidate.ai_rating || undefined)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{getTimeAgo(candidate.created_at)}</span>
              </div>
            </div>
            
            {candidate.jobs?.title && (
              <div className="mt-2 text-xs text-gray-500">
                For: {candidate.jobs.title}
              </div>
            )}
            
            {candidate.ai_summary && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {candidate.ai_summary}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
