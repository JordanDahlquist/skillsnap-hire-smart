
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";

interface Application {
  id: string;
  name: string;
  email: string;
  portfolio: string | null;
  created_at: string;
  ai_rating: number | null;
  ai_summary: string | null;
  status: string;
  experience: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
  manual_rating: number | null;
}

interface ApplicationsListProps {
  applications: Application[];
  selectedApplication: Application | null;
  onSelectApplication: (app: Application) => void;
  getStatusColor: (status: string) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
}

export const ApplicationsList = ({ 
  applications, 
  selectedApplication, 
  onSelectApplication,
  getStatusColor,
  getRatingStars,
  getTimeAgo 
}: ApplicationsListProps) => {
  
  const renderManualRating = (rating: number | null) => {
    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = rating && starValue <= rating;
      
      return (
        <Star
          key={i}
          className={`w-3 h-3 ${
            isActive ? 'text-blue-500 fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const renderAIRating = (rating: number | null) => {
    if (!rating) {
      return Array.from({ length: 3 }, (_, i) => (
        <Star key={i} className="w-3 h-3 text-gray-300" />
      ));
    }

    // Convert 5-star AI rating to 3-star scale
    const convertedRating = (rating / 5) * 3;
    
    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= Math.round(convertedRating);
      
      return (
        <Star
          key={i}
          className={`w-3 h-3 ${
            isActive ? 'text-green-500 fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No applications yet</p>
            <p className="text-sm">Applications will appear here when candidates apply</p>
          </div>
        ) : (
          <div className="space-y-0">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedApplication?.id === app.id ? "bg-purple-50 border-l-4 border-l-purple-600" : ""
                }`}
                onClick={() => onSelectApplication(app)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{app.name}</h3>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status}
                  </Badge>
                </div>
                
                {/* Ratings Section */}
                <div className="space-y-1 mb-2">
                  {/* Manual Rating (You) - Above AI Rating */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">You:</span>
                    <div className="flex gap-0.5">
                      {renderManualRating(app.manual_rating)}
                    </div>
                    {app.manual_rating ? (
                      <span className="text-xs text-blue-600 ml-1 font-medium">
                        {app.manual_rating}/3
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 ml-1">Not rated</span>
                    )}
                  </div>
                  
                  {/* AI Rating */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">AI:</span>
                    <div className="flex gap-0.5">
                      {renderAIRating(app.ai_rating)}
                    </div>
                    {app.ai_rating ? (
                      <span className="text-xs text-green-600 ml-1 font-medium">
                        {Math.round((app.ai_rating / 5) * 3)}/3
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 ml-1">Not rated</span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{getTimeAgo(app.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
