
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedJobCreatorState } from "@/types/jobForm";

export const useJobSaving = () => {
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
      console.error('Authentication required: Please log in to save jobs.');
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
      } else {
        // Create new job
        const { data, error } = await supabase
          .from('jobs')
          .insert(jobData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Reset form and close modal
      resetState();
      onJobCreated?.();
      onClose?.(false);

    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return { saveJob };
};
