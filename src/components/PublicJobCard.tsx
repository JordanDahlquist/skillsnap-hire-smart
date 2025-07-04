import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Calendar, DollarSign, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "@/contexts/ThemeContext";

interface PublicJobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    ai_mini_description?: string | null;
    role_type: string;
    experience_level: string;
    location_type?: string | null;
    country?: string | null;
    state?: string | null;
    region?: string | null;
    city?: string | null;
    budget?: string | null;
    created_at: string;
    duration?: string | null;
    applications?: { count: number }[];
  };
  getTimeAgo: (dateString: string) => string;
}

export const PublicJobCard = ({ job, getTimeAgo }: PublicJobCardProps) => {
  const navigate = useNavigate();
  const { currentTheme } = useThemeContext();

  const handleCardClick = () => {
    navigate(`/apply/${job.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent the card click from triggering when button is clicked
    e.stopPropagation();
  };

  const getLocationDisplay = () => {
    const { location_type, country, state, region, city } = job;
    
    if (location_type === 'remote') {
      if (country) {
        return `Remote (${country})`;
      }
      return 'Remote';
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

  const getDisplayDescription = () => {
    if (job.ai_mini_description) {
      return job.ai_mini_description;
    }
    
    // Fallback to truncated original description
    return job.description.length > 120 
      ? job.description.substring(0, 120) + "..." 
      : job.description;
  };

  const applicationsCount = job.applications?.[0]?.count || 0;

  // Theme-aware colors
  const titleColor = currentTheme === 'black' ? 'text-white' : 'text-gray-900';
  const textColor = currentTheme === 'black' ? 'text-gray-200' : 'text-gray-700';
  const subtleTextColor = currentTheme === 'black' ? 'text-gray-400' : 'text-gray-600';
  const moreSubtleTextColor = currentTheme === 'black' ? 'text-gray-500' : 'text-gray-500';

  return (
    <Card 
      className="cursor-pointer border-l-4 border-l-blue-500 group glass-card-no-hover"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-lg font-semibold mb-2 leading-tight ${titleColor}`}>
              {job.title}
            </CardTitle>
            
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {job.role_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {job.experience_level}
              </Badge>
            </div>
            
            <div className={`flex items-center flex-wrap gap-3 text-xs mb-2 ${subtleTextColor}`}>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{getLocationDisplay()}</span>
              </div>
              {job.budget && (
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <DollarSign className="w-3 h-3" />
                  <span>{job.budget}</span>
                </div>
              )}
              {job.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{job.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{applicationsCount} application{applicationsCount !== 1 ? 's' : ''}</span>
              </div>
              <div className={`flex items-center gap-1 ${moreSubtleTextColor}`}>
                <Calendar className="w-3 h-3" />
                <span>{getTimeAgo(job.created_at)}</span>
              </div>
            </div>
            
            <p className={`text-sm line-clamp-2 leading-relaxed ${textColor}`}>
              {getDisplayDescription()}
            </p>
          </div>
          
          <Button 
            asChild 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            onClick={handleButtonClick}
          >
            <a 
              href={`/apply/${job.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Apply
            </a>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
