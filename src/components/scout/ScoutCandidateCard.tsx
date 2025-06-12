
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Star, Calendar, ExternalLink, MapPin, Mail } from 'lucide-react';
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
    location?: string;
    jobs?: { title: string };
  };
}

export const ScoutCandidateCard = ({ candidate }: ScoutCandidateCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Store application ID in session storage for cross-tab compatibility
    try {
      sessionStorage.setItem('selectedApplicationId', candidate.id);
    } catch (error) {
      console.warn('Could not store application ID in session storage:', error);
    }
    
    navigate(`/dashboard/${candidate.job_id}`, {
      state: { selectedApplicationId: candidate.id }
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 bg-green-100';
    if (rating >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const rating = candidate.ai_rating || candidate.manual_rating || 0;

  return (
    <Card 
      className="cursor-pointer bg-transparent border-0 shadow-none group"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="glass-card border-l-4 border-l-green-500 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl group-hover:border-l-purple-500">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate text-lg">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{candidate.jobs?.title}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge className={`${getStatusColor(candidate.status)} rounded-full px-3`}>
                    {candidate.status}
                  </Badge>
                  {candidate.pipeline_stage && (
                    <Badge variant="outline" className="text-xs rounded-full border-blue-200 bg-blue-50 text-blue-700">
                      {candidate.pipeline_stage}
                    </Badge>
                  )}
                  {rating > 0 && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(rating)}`}>
                      <Star className="w-3 h-3" />
                      <span>{rating}/10</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Mail className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  {candidate.location && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-purple-100 flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-purple-600" />
                      </div>
                      <span>{candidate.location}</span>
                    </div>
                  )}
                </div>
                
                {candidate.ai_summary && (
                  <div className="bg-white/50 rounded-lg p-3 mb-3 border border-white/30">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {candidate.ai_summary.substring(0, 120)}
                      {candidate.ai_summary.length > 120 && '...'}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Applied {getTimeAgo(candidate.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
