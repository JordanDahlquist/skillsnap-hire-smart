
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Job } from "@/types";

export const useJobActions = (job: Job, onJobUpdate: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', job.id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Job is now ${newStatus}`,
      });
      
      onJobUpdate();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDuplicateJob = async () => {
    try {
      const { data: originalJob } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job.id)
        .single();

      if (!originalJob) throw new Error('Job not found');

      const { 
        title, 
        description, 
        role_type, 
        experience_level, 
        budget, 
        required_skills, 
        duration, 
        user_id,
        employment_type,
        location_type, 
        country, 
        state, 
        region, 
        city 
      } = originalJob;
      
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: `${title} (Copy)`,
          description,
          role_type: employment_type || role_type,
          experience_level,
          budget,
          required_skills,
          duration,
          user_id,
          employment_type: employment_type || role_type,
          location_type,
          country,
          state,
          region,
          city,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Job duplicated",
        description: "A copy of the job has been created as a draft",
      });
      
      onJobUpdate();
    } catch (error) {
      console.error('Error duplicating job:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate job",
        variant: "destructive",
      });
    }
  };

  const handleArchiveJob = async () => {
    await handleStatusChange('closed');
  };

  return {
    isUpdating,
    handleStatusChange,
    handleDuplicateJob,
    handleArchiveJob
  };
};
