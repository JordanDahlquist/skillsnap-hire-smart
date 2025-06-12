
import React, { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { applicationService } from '@/services/applicationService';
import { HiringStagesNav } from './HiringStagesNav';
import { ApplicationsList } from './ApplicationsList';
import { ApplicationDetail } from './ApplicationDetail';
import { EmailComposerModal } from './EmailComposerModal';
import { getApplicationStatusColor } from '@/utils/statusUtils';
import { getTimeAgo } from '@/utils/dateUtils';
import { exportApplicationsToCSV } from '@/utils/exportUtils';
import { Application, Job } from '@/types';
import { Star } from 'lucide-react';

interface ApplicationsManagerProps {
  applications: Application[];
  selectedApplication: Application | null;
  onSelectApplication: (application: Application) => void;
  selectedApplications: string[];
  onSelectApplications: (ids: string[]) => void;
  onSendEmail: () => void;
  onApplicationUpdate: () => void;
  job: Job;
}

export const ApplicationsManager = ({
  applications,
  selectedApplication,
  onSelectApplication,
  selectedApplications,
  onSelectApplications,
  onSendEmail,
  onApplicationUpdate,
  job
}: ApplicationsManagerProps) => {
  const { toast } = useToast();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Create getRatingStars helper function
  const getRatingStars = useCallback((rating: number | null) => {
    const stars = [];
    const ratingValue = rating || 0;
    
    for (let i = 1; i <= 3; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= ratingValue 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-muted-foreground'
          }`}
        />
      );
    }
    return stars;
  }, []);

  // Filter applications by stage
  const filteredApplications = useMemo(() => {
    if (selectedStage === null) return applications;
    
    return applications.filter(app => {
      const appStage = app.pipeline_stage || 'applied';
      return appStage === selectedStage;
    });
  }, [applications, selectedStage]);

  // Get selected application objects for email modal
  const selectedApplicationObjects = useMemo(() => {
    return applications.filter(app => selectedApplications.includes(app.id));
  }, [applications, selectedApplications]);

  const handleEmailComposer = useCallback(() => {
    if (selectedApplications.length === 0) {
      toast({
        title: "No applications selected",
        description: "Please select at least one application to send emails.",
        variant: "destructive",
      });
      return;
    }
    setIsEmailModalOpen(true);
  }, [selectedApplications.length, toast]);

  const handleBulkSetRating = useCallback(async (rating: number) => {
    if (selectedApplications.length === 0) return;

    setIsUpdating(true);
    try {
      await applicationService.bulkUpdateApplications(selectedApplications, { 
        manual_rating: rating,
        status: 'reviewed'
      });
      
      toast({
        title: "Rating set",
        description: `Set ${rating} star${rating > 1 ? 's' : ''} for ${selectedApplications.length} application${selectedApplications.length > 1 ? 's' : ''}`,
      });
      
      onSelectApplications([]);
      onApplicationUpdate();
    } catch (error) {
      console.error('Error setting rating:', error);
      toast({
        title: "Error",
        description: "Failed to set application rating",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedApplications, toast, onSelectApplications, onApplicationUpdate]);

  const handleBulkMoveToStage = useCallback(async (stage: string) => {
    if (selectedApplications.length === 0) return;

    setIsUpdating(true);
    try {
      await applicationService.bulkUpdateApplications(selectedApplications, { 
        pipeline_stage: stage 
      });
      
      toast({
        title: "Stage updated",
        description: `Moved ${selectedApplications.length} application${selectedApplications.length > 1 ? 's' : ''} to ${stage.replace('_', ' ')}`,
      });
      
      onSelectApplications([]);
      onApplicationUpdate();
    } catch (error) {
      console.error('Error moving to stage:', error);
      toast({
        title: "Error",
        description: "Failed to move applications to stage",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedApplications, toast, onSelectApplications, onApplicationUpdate]);

  const handleBulkReject = useCallback(async () => {
    if (selectedApplications.length === 0) return;

    setIsUpdating(true);
    try {
      await applicationService.bulkUpdateApplications(selectedApplications, { 
        status: 'rejected',
        rejection_reason: 'Bulk rejection'
      });
      
      toast({
        title: "Applications rejected",
        description: `Rejected ${selectedApplications.length} application${selectedApplications.length > 1 ? 's' : ''}`,
      });
      
      onSelectApplications([]);
      onApplicationUpdate();
    } catch (error) {
      console.error('Error rejecting applications:', error);
      toast({
        title: "Error",
        description: "Failed to reject applications",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [selectedApplications, toast, onSelectApplications, onApplicationUpdate]);

  return (
    <div className="flex-1">
      <HiringStagesNav
        jobId={job.id}
        applications={applications}
        selectedStage={selectedStage}
        onStageSelect={setSelectedStage}
      />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Applications Grid - Optimized layout with narrower list and wider profile */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
            <ApplicationsList
              applications={filteredApplications}
              selectedApplication={selectedApplication}
              onSelectApplication={onSelectApplication}
              getStatusColor={getApplicationStatusColor}
              getTimeAgo={getTimeAgo}
              selectedApplications={selectedApplications}
              onSelectApplications={onSelectApplications}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSendEmail={handleEmailComposer}
              onSetRating={handleBulkSetRating}
              onMoveToStage={handleBulkMoveToStage}
              onReject={handleBulkReject}
              jobId={job.id}
              isLoading={isUpdating}
            />

            {selectedApplication && (
              <ApplicationDetail
                selectedApplication={selectedApplication}
                applications={applications}
                job={job}
                getStatusColor={getApplicationStatusColor}
                getRatingStars={getRatingStars}
                getTimeAgo={getTimeAgo}
                onApplicationUpdate={onApplicationUpdate}
              />
            )}
          </div>
        </div>
      </div>

      <EmailComposerModal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        selectedApplications={selectedApplicationObjects}
        job={job}
      />
    </div>
  );
};
