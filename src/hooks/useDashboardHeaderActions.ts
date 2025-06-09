import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Job, Application } from "@/types";

export const useDashboardHeaderActions = (
  job: Job, 
  applications: Application[], 
  onJobUpdate: () => void
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const handleRefreshAI = async () => {
    if (isRefreshingAI || applications.length === 0) return;

    setIsRefreshingAI(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      toast({
        title: "Refreshing AI rankings",
        description: `Analyzing ${applications.length} applications...`,
      });

      // Process applications in batches to avoid overwhelming the system
      const batchSize = 3;
      for (let i = 0; i < applications.length; i += batchSize) {
        const batch = applications.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (application) => {
            try {
              console.log('Refreshing AI analysis for application:', application.id);
              
              const analysisData = {
                name: application.name,
                email: application.email,
                portfolio: application.portfolio,
                experience: application.experience || '',
                answer_1: application.answer_1,
                answer_2: application.answer_2,
                answer_3: application.answer_3
              };

              const jobData = {
                title: job.title,
                description: job.description,
                role_type: job.role_type,
                experience_level: job.experience_level,
                required_skills: job.required_skills
              };

              const { data, error } = await supabase.functions.invoke('analyze-application', {
                body: {
                  applicationData: analysisData,
                  jobData
                }
              });

              if (error) {
                console.error('AI analysis error for application:', application.id, error);
                errorCount++;
                return;
              }

              if (data?.rating && data?.summary) {
                const { error: updateError } = await supabase
                  .from('applications')
                  .update({
                    ai_rating: data.rating,
                    ai_summary: data.summary,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', application.id);

                if (updateError) {
                  console.error('Error updating application:', application.id, updateError);
                  errorCount++;
                } else {
                  successCount++;
                }
              }
            } catch (error) {
              console.error('Error processing application:', application.id, error);
              errorCount++;
            }
          })
        );

        // Small delay between batches
        if (i + batchSize < applications.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Show completion message
      if (successCount > 0) {
        toast({
          title: "AI rankings refreshed",
          description: `Successfully analyzed ${successCount} applications${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
        onJobUpdate(); // Refresh the data
      } else {
        toast({
          title: "Refresh failed",
          description: "Unable to refresh AI rankings. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('AI refresh failed:', error);
      toast({
        title: "Refresh failed",
        description: "An error occurred while refreshing AI rankings",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    console.log('Status change initiated:', { jobId: job.id, from: job.status, to: newStatus });
    
    // Prevent multiple concurrent updates
    if (isUpdating) {
      console.log('Update already in progress, ignoring');
      return;
    }

    setIsUpdating(true);
    
    try {
      // Enhanced authentication validation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error: Unable to verify session');
      }

      if (!session?.user) {
        console.error('No authenticated user found');
        throw new Error('You must be logged in to update job status');
      }

      console.log('Authentication validated:', { userId: session.user.id, jobUserId: job.user_id });

      // Verify job ownership
      if (job.user_id !== session.user.id) {
        console.error('User does not own this job:', { jobUserId: job.user_id, currentUserId: session.user.id });
        throw new Error('You can only update jobs that you own');
      }

      console.log('Attempting database update with enhanced error handling...');

      // Perform the status update with proper error handling
      const { data, error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', job.id)
        .eq('user_id', session.user.id) // Double-check ownership in query
        .select();

      if (error) {
        console.error('Database update error:', error);
        
        // Enhanced error handling with specific error types
        if (error.code === 'PGRST116') {
          throw new Error('Job not found or access denied');
        } else if (error.message.includes('row-level security')) {
          throw new Error('You do not have permission to update this job');
        } else if (error.code === '42501') {
          throw new Error('Insufficient permissions to update job status');
        } else if (error.message.includes('JWT')) {
          throw new Error('Authentication token expired. Please refresh and try again.');
        } else {
          throw new Error(`Update failed: ${error.message}`);
        }
      }

      if (!data || data.length === 0) {
        throw new Error('No job was updated. Please check your permissions.');
      }

      console.log('Status update successful:', data);

      toast({
        title: "Status updated",
        description: `Job status changed to ${newStatus}`,
      });
      
      // Trigger data refresh
      onJobUpdate();
      
    } catch (error) {
      console.error('Status update failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update job status';
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });

      // If authentication error, suggest refresh
      if (errorMessage.includes('token') || errorMessage.includes('Authentication')) {
        setTimeout(() => {
          toast({
            title: "Try refreshing",
            description: "Your session may have expired. Try refreshing the page.",
          });
        }, 2000);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareJob = async () => {
    const jobUrl = `${window.location.origin}/apply/${job.id}`;
    try {
      await navigator.clipboard.writeText(jobUrl);
      toast({
        title: "Link copied!",
        description: "Job application link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleExportApplications = () => {
    if (applications.length === 0) {
      toast({
        title: "No data to export",
        description: "This job has no applications yet",
      });
      return;
    }

    try {
      const csvContent = [
        ['Name', 'Email', 'Applied Date', 'AI Rating', 'Status'].join(','),
        ...applications.map(app => [
          app.name,
          app.email,
          new Date(app.created_at).toLocaleDateString(),
          app.ai_rating || 'N/A',
          app.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_applications.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export completed",
        description: "Applications data exported to CSV file",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to export applications data",
        variant: "destructive",
      });
    }
  };

  const handleEditJob = () => {
    setIsEditModalOpen(true);
  };

  const handleArchiveJob = async () => {
    await handleStatusChange('closed');
  };

  const handleUnarchiveJob = async () => {
    await handleStatusChange('active');
  };

  return {
    isUpdating,
    isRefreshingAI,
    isEditModalOpen,
    setIsEditModalOpen,
    handleStatusChange,
    handleShareJob,
    handleExportApplications,
    handleEditJob,
    handleArchiveJob,
    handleUnarchiveJob,
    handleRefreshAI
  };
};
