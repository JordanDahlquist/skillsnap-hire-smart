
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    
    setIsUpdating(true);
    try {
      // Determine the new status based on current status and rating
      let newStatus = selectedApplication.status;
      if (selectedApplication.status === 'pending' && rating > 0) {
        newStatus = 'reviewed';
      }

      const { error } = await supabase
        .from('applications')
        .update({ 
          manual_rating: rating,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      const statusMessage = newStatus !== selectedApplication.status 
        ? ` and marked as reviewed`
        : '';

      toast({
        title: "Rating updated",
        description: `Candidate rated ${rating} star${rating > 1 ? 's' : ''}${statusMessage}`,
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

  const renderManualRatingStars = (currentRating: number | null) => {
    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = currentRating && starValue <= currentRating;
      
      return (
        <button
          key={i}
          onClick={() => handleManualRating(starValue)}
          disabled={isUpdating}
          className={`transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
            isActive ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'
          }`}
        >
          <Star 
            className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`}
          />
        </button>
      );
    });
  };

  if (selectedApplication) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{selectedApplication.name}</CardTitle>
              <p className="text-gray-600">{selectedApplication.email}</p>
            </div>
            <div className="flex flex-col gap-3">
              {/* Manual Rating Section */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                <div className="flex gap-1">
                  {renderManualRatingStars(selectedApplication.manual_rating)}
                </div>
                {selectedApplication.manual_rating && (
                  <span className="text-xs text-gray-500">
                    {selectedApplication.manual_rating} star{selectedApplication.manual_rating > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {/* Action Buttons */}
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
