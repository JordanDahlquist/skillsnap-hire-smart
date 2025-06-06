
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Calendar } from "lucide-react";

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
  };
  getTimeAgo: (dateString: string) => string;
}

export const PublicJobCard = ({ job, getTimeAgo }: PublicJobCardProps) => {
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
    return job.description.length > 150 
      ? job.description.substring(0, 150) + "..." 
      : job.description;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">
                {job.title}
              </CardTitle>
            </div>
            
            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-2">
              <span>{job.role_type} • {job.experience_level}</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{getLocationDisplay()}</span>
              </div>
              {job.budget && (
                <div className="flex items-center gap-1 text-green-600">
                  <span className="font-medium">{job.budget}</span>
                </div>
              )}
              {job.duration && (
                <div className="flex items-center gap-1">
                  <span>{job.duration}</span>
                </div>
              )}
            </div>
            
            <div className="mb-3">
              <p className="text-gray-700 line-clamp-3">{getDisplayDescription()}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Posted {getTimeAgo(job.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-end">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <a 
              href={`/apply/${job.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Apply Now
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
