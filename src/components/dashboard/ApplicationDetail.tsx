import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsDown, Eye, Users, ExternalLink, Star, UserCheck } from "lucide-react";
import { ApplicationTabs } from "./ApplicationTabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

interface Job {
  id: string;
}

interface ApplicationDetailProps {
  selectedApplication: Application | null;
  applications: Application[];
  job: Job;
  getStatusColor: (status: string) => string;
  getRatingStars: (rating: number | null) => JSX.Element[];
  getTimeAgo: (dateString: string) => string;
  onApplicationUpdate?: () => void;
}

export const ApplicationDetail = ({ 
  selectedApplication, 
  applications, 
  job,
  getStatusColor,
  getRatingStars,
  getTimeAgo,
  onApplicationUpdate 
}: ApplicationDetailProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleManualRating = async (rating: number) => {
    if (!selectedApplication || isUpdating) return;
    
    // If clicking the same 1-star rating, unselect it (set to null)
    const newRating = selectedApplication.manual_rating === rating && rating === 1 ? null : rating;
    
    setIsUpdating(true);
    try {
      // Determine the new status based on current status and rating
      let newStatus = selectedApplication.status;
      if (selectedApplication.status === 'pending' && newRating && newRating > 0) {
        newStatus = 'reviewed';
      }

      const { error } = await supabase
        .from('applications')
        .update({ 
          manual_rating: newRating,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      const ratingMessage = newRating 
        ? `Candidate rated ${newRating} star${newRating > 1 ? 's' : ''}`
        : 'Rating cleared';
      
      const statusMessage = newStatus !== selectedApplication.status 
        ? ` and marked as reviewed`
        : '';

      toast({
        title: "Rating updated",
        description: `${ratingMessage}${statusMessage}`,
      });
      
      if (onApplicationUpdate) {
        onApplicationUpdate();
      }
    } catch (error) {
      console.error('Error updating manual rating:', error);
      toast({
        title: "Error",
        description: "Failed to update rating",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      toast({
        title: "Application rejected",
        description: `${selectedApplication.name}'s application has been rejected`,
      });
      
      if (onApplicationUpdate) {
        onApplicationUpdate();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderAIRating = (rating: number | null) => {
    if (!rating) {
      return Array.from({ length: 3 }, (_, i) => (
        <Star key={i} className="w-5 h-5 text-gray-300" />
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
          className={`w-5 h-5 ${
            isActive ? 'text-green-500 fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const renderManualRatingStars = (currentRating: number | null) => {
    const shimmerClasses = ['animate-star-shimmer-1', 'animate-star-shimmer-2', 'animate-star-shimmer-3'];
    
    return (
      <div className="flex gap-1">
        {Array.from({ length: 3 }, (_, i) => {
          const starValue = i + 1;
          const isActive = currentRating && starValue <= currentRating;
          
          return (
            <button
              key={i}
              onClick={() => handleManualRating(starValue)}
              disabled={isUpdating}
              className={`transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
                isActive ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'
              } ${!currentRating ? shimmerClasses[i] : ''}`}
            >
              <Star 
                className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  if (selectedApplication) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle>{selectedApplication.name}</CardTitle>
                <Badge className={getStatusColor(selectedApplication.status)}>
                  {selectedApplication.status}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{selectedApplication.email}</p>
              
              {/* Action Buttons - moved under candidate info */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleReject}
                  disabled={isUpdating || selectedApplication.status === 'rejected'}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  size="sm" 
                  disabled={true}
                  className="bg-green-600 hover:bg-green-700 opacity-50 cursor-not-allowed"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Hire (Coming Soon)
                </Button>
              </div>
            </div>
            
            {/* Rating Sections - Compact Design */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start gap-6">
                {/* Manual Rating Section - Left */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm font-semibold text-gray-800">Your Rating</span>
                  {renderManualRatingStars(selectedApplication.manual_rating)}
                  <span className="text-xs text-gray-500 min-h-[16px]">
                    {selectedApplication.manual_rating 
                      ? `${selectedApplication.manual_rating} star${selectedApplication.manual_rating > 1 ? 's' : ''}`
                      : 'Click to rate'
                    }
                  </span>
                </div>

                {/* Visual Divider */}
                <div className="w-px h-16 bg-gray-300"></div>

                {/* AI Rating Section - Right */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-semibold text-gray-800">AI Rating</span>
                  <div className="flex gap-1">
                    {renderAIRating(selectedApplication.ai_rating)}
                  </div>
                  <span className="text-xs text-green-600 font-medium min-h-[16px]">
                    {selectedApplication.ai_rating 
                      ? `${Math.round((selectedApplication.ai_rating / 5) * 3)}/3`
                      : 'Not rated'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ApplicationTabs 
            application={selectedApplication}
            getStatusColor={getStatusColor}
            getRatingStars={getRatingStars}
            getTimeAgo={getTimeAgo}
          />
        </CardContent>
      </Card>
    );
  }

  if (applications.length > 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select an application to view details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 text-center text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">No Applications Yet</p>
        <p>Share your job posting link to start receiving applications!</p>
        <Button className="mt-4" variant="outline" asChild>
          <a href={`/apply/${job.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Job Application Page
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
