
import { useState } from "react";
import { EmailComposerModal } from "./EmailComposerModal";
import { ApplicationDetailContent } from "./components/ApplicationDetailContent";
import { ApplicationRejectionDialog } from "./components/ApplicationRejectionDialog";
import { ApplicationDetailFallback } from "./components/ApplicationDetailFallback";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Application } from "@/types";
import { useCandidateInboxData } from "@/hooks/useCandidateInboxData";
import { useSimpleRejection } from "@/hooks/useSimpleRejection";

interface JobForApplicationDetail {
  id: string;
  title?: string;
  description?: string;
}

interface ApplicationDetailProps {
  selectedApplication: Application | null;
  applications: Application[];
  job: JobForApplicationDetail;
  getStatusColor: (status: string, manualRating?: number | null) => string;
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

  // Get the sendReply function for email functionality
  const { sendReply } = useCandidateInboxData(selectedApplication?.id || '');
  
  // Use the unified rejection system that sends emails
  const { rejectWithEmail, unrejectApplication, isRejecting } = useSimpleRejection(
    selectedApplication!,
    job as any,
    sendReply,
    onApplicationUpdate
  );

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
    if (!selectedApplication || isUpdating || isRejecting) return;
    setShowRejectDialog(true);
  };

  const handleUnreject = async () => {
    if (!selectedApplication || isUpdating || isRejecting) return;
    
    try {
      await unrejectApplication();
    } catch (error) {
      console.error('Error unrejecting application:', error);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedApplication || isUpdating || isRejecting || !selectedRejectionReason) return;
    
    const finalReason = selectedRejectionReason === "Other" ? customReason : selectedRejectionReason;
    
    try {
      // Use the unified rejection system that sends emails
      await rejectWithEmail(finalReason);
      
      setShowRejectDialog(false);
      setSelectedRejectionReason("");
      setCustomReason("");
      
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    }
  };

  const handleCancelRejection = () => {
    setShowRejectDialog(false);
    setSelectedRejectionReason("");
    setCustomReason("");
  };

  const handleStageChange = (applicationId: string, newStage: string) => {
    // The StageSelector component handles the database update automatically
    // We just need to trigger a refresh of the applications list
    if (onApplicationUpdate) {
      onApplicationUpdate();
    }
  };

  if (selectedApplication) {
    return (
      <>
        <ApplicationDetailContent
          application={selectedApplication}
          getStatusColor={(status: string) => getStatusColor(status, selectedApplication.manual_rating)}
          getRatingStars={getRatingStars}
          getTimeAgo={getTimeAgo}
          isUpdating={isUpdating || isRejecting}
          onManualRating={handleManualRating}
          onReject={handleReject}
          onUnreject={handleUnreject}
          onEmail={() => setShowEmailModal(true)}
          jobId={job.id}
          onStageChange={handleStageChange}
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
          isUpdating={isRejecting}
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
