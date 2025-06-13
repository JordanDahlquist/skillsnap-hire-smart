
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UnifiedJobFormData, UnifiedJobCreatorState, UnifiedJobCreatorActions } from "@/types/jobForm";

const initialFormData: UnifiedJobFormData = {
  title: "",
  description: "",
  employmentType: "project",
  experienceLevel: "intermediate",
  skills: "",
  budget: "",
  duration: "",
  location: "",
  locationType: "remote",
  country: "",
  state: "",
  city: "",
  companyName: ""
};

const initialState: UnifiedJobCreatorState = {
  currentStep: 1,
  isGenerating: false,
  isSaving: false,
  formData: initialFormData,
  generatedJobPost: "",
  generatedSkillsTest: "",
  generatedInterviewQuestions: "",
  interviewVideoMaxLength: 5,
  isEditingJobPost: false,
  isEditingSkillsTest: false,
  isEditingInterviewQuestions: false,
  isEditMode: false,
  editingJobId: undefined
};

export const useUnifiedJobCreator = (
  onJobCreated?: () => void,
  onClose?: (open: boolean) => void,
  editingJob?: any
) => {
  const [state, setState] = useState<UnifiedJobCreatorState>(initialState);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const actions: UnifiedJobCreatorActions = {
    setCurrentStep: (step) => setState(prev => ({ ...prev, currentStep: step })),
    setIsGenerating: (loading) => setState(prev => ({ ...prev, isGenerating: loading })),
    setIsSaving: (saving) => setState(prev => ({ ...prev, isSaving: saving })),
    updateFormData: (field, value) => setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    })),
    setGeneratedJobPost: (content) => setState(prev => ({ ...prev, generatedJobPost: content })),
    setGeneratedSkillsTest: (content) => setState(prev => ({ ...prev, generatedSkillsTest: content })),
    setGeneratedInterviewQuestions: (content) => setState(prev => ({ ...prev, generatedInterviewQuestions: content })),
    setInterviewVideoMaxLength: (length) => setState(prev => ({ ...prev, interviewVideoMaxLength: length })),
    setIsEditingJobPost: (editing) => setState(prev => ({ ...prev, isEditingJobPost: editing })),
    setIsEditingSkillsTest: (editing) => setState(prev => ({ ...prev, isEditingSkillsTest: editing })),
    setIsEditingInterviewQuestions: (editing) => setState(prev => ({ ...prev, isEditingInterviewQuestions: editing })),
    setEditMode: (isEdit, jobId) => setState(prev => ({ ...prev, isEditMode: isEdit, editingJobId: jobId })),
    populateFormFromJob: (job) => {
      const budgetParts = parseBudgetRange(job.budget || "");
      setState(prev => ({
        ...prev,
        isEditMode: true,
        editingJobId: job.id,
        formData: {
          title: job.title || "",
          description: job.description || "",
          employmentType: job.employment_type || job.role_type || "project",
          experienceLevel: job.experience_level || "intermediate",
          skills: job.required_skills || "",
          budget: job.budget || "",
          duration: job.duration || "",
          location: job.location || "",
          locationType: job.location_type || "remote",
          country: job.country || "",
          state: job.state || "",
          city: job.city || "",
          companyName: job.company_name || ""
        },
        generatedJobPost: job.generated_job_post || "",
        generatedSkillsTest: job.generated_test || "",
        generatedInterviewQuestions: job.generated_interview_questions || "",
        interviewVideoMaxLength: job.interview_video_max_length || 5
      }));
    }
  };

  // Helper function to parse budget range
  const parseBudgetRange = (budget: string) => {
    if (!budget) return { min: "", max: "" };
    const rangeMatch = budget.match(/^(.+?)\s*-\s*(.+)$/);
    if (rangeMatch) {
      return { min: rangeMatch[1].trim(), max: rangeMatch[2].trim() };
    }
    const upToMatch = budget.match(/^Up to (.+)$/i);
    if (upToMatch) {
      return { min: "", max: upToMatch[1].trim() };
    }
    return { min: budget, max: "" };
  };

  const handleGenerateJobPost = async () => {
    actions.setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: state.formData
        }
      });

      if (response.error) throw response.error;
      
      actions.setGeneratedJobPost(response.data.jobPost);
      toast({
        title: "Job post generated!",
        description: "Your job post has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating job post:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate job post. Please try again.",
        variant: "destructive",
      });
    } finally {
      actions.setIsGenerating(false);
    }
  };

  const handleGenerateSkillsTest = async () => {
    actions.setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'skills-test',
          existingJobPost: state.generatedJobPost
        }
      });

      if (response.error) throw response.error;
      
      actions.setGeneratedSkillsTest(response.data.test);
      toast({
        title: "Skills test generated!",
        description: "Your skills test has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating skills test:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate skills test. Please try again.",
        variant: "destructive",
      });
    } finally {
      actions.setIsGenerating(false);
    }
  };

  const handleGenerateInterviewQuestions = async () => {
    actions.setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'interview-questions',
          jobData: state.formData,
          existingJobPost: state.generatedJobPost,
          existingSkillsTest: state.generatedSkillsTest
        }
      });

      if (response.error) throw response.error;
      
      actions.setGeneratedInterviewQuestions(response.data.questions);
      toast({
        title: "Interview questions generated!",
        description: "Your interview questions have been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating interview questions:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      actions.setIsGenerating(false);
    }
  };

  const handleSaveJob = async (status: 'draft' | 'active') => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to save jobs.",
        variant: "destructive",
      });
      return;
    }

    actions.setIsSaving(true);
    try {
      const jobData = {
        title: state.formData.title,
        description: state.formData.description,
        role_type: state.formData.employmentType,
        experience_level: state.formData.experienceLevel,
        required_skills: state.formData.skills,
        budget: state.formData.budget || null,
        duration: state.formData.duration || null,
        location_type: state.formData.locationType,
        employment_type: state.formData.employmentType,
        country: state.formData.country || null,
        state: state.formData.state || null,
        city: state.formData.city || null,
        company_name: state.formData.companyName || profile?.company_name || 'Your Company',
        generated_job_post: state.generatedJobPost || null,
        generated_test: state.generatedSkillsTest || null,
        generated_interview_questions: state.generatedInterviewQuestions || null,
        interview_video_max_length: state.interviewVideoMaxLength,
        status,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

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
      setState(initialState);
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
      actions.setIsSaving(false);
    }
  };

  return {
    state,
    actions,
    handleGenerateJobPost,
    handleGenerateSkillsTest,
    handleGenerateInterviewQuestions,
    handleSaveJob
  };
};
