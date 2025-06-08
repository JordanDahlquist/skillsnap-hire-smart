import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsDown, Eye, Users, ExternalLink, Star, UserCheck, RotateCcw } from "lucide-react";
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
  rejection_reason: string | null;
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

const rejectionReasons = [
  "Insufficient Experience",
  "Skills Mismatch", 
  "Unsuccessful Assessment",
  "Unsuccessful Interview",
  "Overqualified",
  "Location Requirements",
  "Salary Expectations",
  "Poor Application Quality",
  "Position Filled",
  "Other"
];

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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
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

  const handleReject = () => {
    if (!selectedApplication || isUpdating) return;
    setShowRejectDialog(true);
  };

  const handleUnreject = async () => {
    if (!selectedApplication || isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Determine the new status - if they had a manual rating, set to 'reviewed', otherwise 'pending'
      const newStatus = selectedApplication.manual_rating ? 'reviewed' : 'pending';
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      toast({
        title: "Application unrejected",
        description: `${selectedApplication.name}'s application has been restored to ${newStatus} status`,
      });
      
      if (onApplicationUpdate) {
        onApplicationUpdate();
      }
    } catch (error) {
      console.error('Error unrejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to unreject application",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedApplication || isUpdating || !selectedRejectionReason) return;
    
    const finalReason = selectedRejectionReason === "Other" ? customReason : selectedRejectionReason;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          rejection_reason: finalReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      toast({
        title: "Application rejected",
        description: `${selectedApplication.name}'s application has been rejected: ${finalReason}`,
      });
      
      setShowRejectDialog(false);
      setSelectedRejectionReason("");
      setCustomReason("");
      
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

  const handleCancelRejection = () => {
    setShowRejectDialog(false);
    setSelectedRejectionReason("");
    setCustomReason("");
  };

  const renderAIRating = (rating: number | null) => {
    if (!rating) {
      return Array.from({ length: 3 }, (_, i) => (
        <Star key={i} className="w-5 h-5 text-gray-300" />
      ));
    }
    
    return Array.from({ length: 3 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= Math.round(rating);
      
      return (
        <Star
          key={i}
          className={`w-5 h-5 ${
            isActive ? 'text-purple-500 fill-current' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const renderManualRatingStars = (currentRating: number | null) => {
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
              }`}
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
      <>
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
                  {selectedApplication.status === 'rejected' ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleUnreject}
                      disabled={isUpdating}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Unreject
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleReject}
                      disabled={isUpdating}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
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
                    <span className="text-xs text-purple-600 font-medium min-h-[16px]">
                      {selectedApplication.ai_rating 
                        ? `${selectedApplication.ai_rating.toFixed(1)}/3`
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

        {/* Rejection Reason Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject {selectedApplication.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please select a reason for rejecting this application:
              </p>
              
              <RadioGroup value={selectedRejectionReason} onValueChange={setSelectedRejectionReason}>
                {rejectionReasons.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason} id={reason} />
                    <Label htmlFor={reason} className="text-sm cursor-pointer">
                      {reason}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {selectedRejectionReason === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-reason" className="text-sm font-medium">
                    Please specify:
                  </Label>
                  <Textarea
                    id="custom-reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter specific rejection reason..."
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCancelRejection}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleConfirmRejection}
                disabled={isUpdating || !selectedRejectionReason || (selectedRejectionReason === "Other" && !customReason.trim())}
              >
                {isUpdating ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
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
