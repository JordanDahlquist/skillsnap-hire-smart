
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGenerateMiniDescription } from "@/hooks/useGenerateMiniDescription";
import { logger } from "@/services/loggerService";
import { FormData } from "../utils/types";

export const useJobCreation = (
  form: UseFormReturn<FormData>,
  generatedJobPost: string,
  generatedSkillsTest: string,
  onClose: () => void,
  onReset: () => void
) => {
  const { user } = useAuth();
  const { generateMiniDescription } = useGenerateMiniDescription();
  const [isSaving, setIsSaving] = useState(false);

  const submitJob = async (values: FormData, status: 'draft' | 'active') => {
    logger.debug('submitJob called with:', { values, status });
    logger.debug('Auth state at submit:', { user: !!user, userId: user?.id });

    if (!user?.id) {
      logger.error('No user ID available');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a job.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const jobData = {
        title: values.title,
        description: values.description,
        role_type: values.employment_type,
        experience_level: values.experience_level,
        required_skills: values.required_skills,
        budget: values.budget || "",
        duration: values.duration || "",
        user_id: user.id,
        status: status,
        employment_type: values.employment_type,
        location_type: values.location_type,
        country: values.country,
        state: values.state || "",
        region: values.region || "",
        city: values.city || "",
        generated_job_post: generatedJobPost || null,
        generated_test: generatedSkillsTest || null
      };

      logger.debug('Submitting job data:', jobData);

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        logger.error('Error creating job:', error);
        throw error;
      }

      logger.debug('Job created successfully:', data);

      toast({
        title: status === 'active' ? "Job Published!" : "Draft Saved!",
        description: status === 'active' 
          ? "Your job is now live and accepting applications!" 
          : "Job saved as draft successfully!"
      });

      if (data.id) {
        await generateMiniDescription({
          id: data.id,
          title: values.title,
          description: values.description,
          role_type: values.employment_type
        });
      }

      onReset();
      onClose();
    } catch (error) {
      logger.error('Error in job creation:', error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitAsDraft = async () => {
    logger.debug('Draft button clicked');
    const isValid = await form.trigger();
    logger.debug('Form validation result for draft:', isValid);
    
    if (isValid) {
      const values = form.getValues();
      await submitJob(values, 'draft');
    } else {
      logger.debug('Form validation failed for draft');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };

  const onSubmitAsPublished = async (allTabsComplete: boolean, getIncompleteTabsMessage: () => string) => {
    logger.debug('Publish button clicked');
    logger.debug('All tabs complete:', allTabsComplete);
    
    if (!allTabsComplete) {
      toast({
        title: "Incomplete Form",
        description: getIncompleteTabsMessage(),
        variant: "destructive"
      });
      return;
    }
    
    const isValid = await form.trigger();
    logger.debug('Form validation result for publish:', isValid);
    
    if (isValid) {
      const values = form.getValues();
      await submitJob(values, 'active');
    } else {
      logger.debug('Form validation failed for publish');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };

  return {
    isSaving,
    onSubmitAsDraft,
    onSubmitAsPublished
  };
};
