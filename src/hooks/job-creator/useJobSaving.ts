
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedJobCreatorState } from "@/types/jobForm";

export const useJobSaving = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const saveJob = async (
    state: UnifiedJobCreatorState,
    status: 'draft' | 'active',
    setIsSaving: (saving: boolean) => void,
    resetState: () => void,
    onJobCreated?: () => void,
    onClose?: (open: boolean) => void
  ) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to save jobs.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const isProjectBased = state.formData.employmentType === 'project';
      const jobData = {
        title: state.formData.title,
        description: state.generatedJobPost || '', // Use generated job post as description
        role_type: state.formData.employmentType,
        experience_level: state.formData.experienceLevel,
        required_skills: state.formData.skills,
        budget: isProjectBased ? (state.formData.budget || null) : (state.formData.salary || null),
        duration: isProjectBased ? (state.formData.duration || null) : null,
        location_type: state.formData.locationType,
        employment_type: state.formData.employmentType,
        country: state.formData.country || null,
        state: state.formData.state || null,
        city: state.formData.city || null,
        company_name: state.formData.companyName || profile?.company_name || 'Your Company',
        generated_job_post: state.generatedJobPost || null,
        generated_test: state.skillsTestData.questions.length > 0 
          ? JSON.stringify(state.skillsTestData) 
          : null,
        generated_interview_questions: state.generatedInterviewQuestions || null,
        status,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (!isProjectBased && state.formData.benefits) {
        jobData.generated_job_post = (jobData.generated_job_post || '') + `\n\n## Benefits\n\n${state.formData.benefits}`;
      }

      let result;
      if (state.isEditMode && state.editingJobId) {
        // Update existing job
        const { data, error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', state.editingJobId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: "Job updated!",
          description: "Your job has been updated successfully.",
        });
      } else {
        // Create new job
        const { data, error } = await supabase
          .from('jobs')
          .insert(jobData)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: status === 'active' ? "Job published!" : "Job saved as draft!",
          description: status === 'active' 
            ? "Your job has been published and is now live." 
            : "Your job has been saved as a draft.",
        });
      }

      // Reset form and close modal
      resetState();
      onJobCreated?.();
      onClose?.(false);

    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Save failed",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { saveJob };
};
