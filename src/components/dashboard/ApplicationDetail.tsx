import { useState } from "react";
import { EmailComposerModal } from "./EmailComposerModal";
import { ApplicationDetailContent } from "./components/ApplicationDetailContent";
import { ApplicationRejectionDialog } from "./components/ApplicationRejectionDialog";
import { ApplicationDetailFallback } from "./components/ApplicationDetailFallback";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Application } from "@/types";

interface JobForApplicationDetail {
  id: string;
  title?: string;
  description?: string;
}

interface ApplicationDetailProps {
  selectedApplication: Application | null;
  applications: Application[];
  job: JobForApplicationDetail;
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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { toast } = useToast();

  const handleManualRating = async (rating: number) => {
    if (!selectedApplication || isUpdating) return;
    
    // If clicking the same 1-star rating, unselect it (set to null)
    const newRating = selectedApplication.manual_rating === rating && rating === 1 ? null : rating;
    
    setIsUpdating(true);
    try {
      // Determine the new status based on current status and rating
      let newStatus = selectedApplication.status;
      
      // If we're clearing the rating (newRating is null)
      if (newRating === null) {
        // If status was 'reviewed' and we're clearing the rating, go back to 'pending'
        if (selectedApplication.status === 'reviewed') {
          newStatus = 'pending';
        }
      } else {
        // If we're setting a rating and status is 'pending', mark as 'reviewed'
        if (selectedApplication.status === 'pending') {
          newStatus = 'reviewed';
        }
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
        ? ` and marked as ${newStatus}`
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

  if (selectedApplication) {
    return (
      <>
        <ApplicationDetailContent
          application={selectedApplication}
          getStatusColor={getStatusColor}
          getRatingStars={getRatingStars}
          getTimeAgo={getTimeAgo}
          isUpdating={isUpdating}
          onManualRating={handleManualRating}
          onReject={handleReject}
          onUnreject={handleUnreject}
          onEmail={() => setShowEmailModal(true)}
        />

        <EmailComposerModal
          open={showEmailModal}
          onOpenChange={setShowEmailModal}
          selectedApplications={[selectedApplication]}
          job={job as any}
        />

        <ApplicationRejectionDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          candidateName={selectedApplication.name}
          selectedReason={selectedRejectionReason}
          customReason={customReason}
          isUpdating={isUpdating}
          onReasonChange={setSelectedRejectionReason}
          onCustomReasonChange={setCustomReason}
          onConfirm={handleConfirmRejection}
          onCancel={handleCancelRejection}
        />
      </>
    );
  }

  return (
    <ApplicationDetailFallback 
      hasApplications={applications.length > 0}
      jobId={job.id}
    />
  );
};
