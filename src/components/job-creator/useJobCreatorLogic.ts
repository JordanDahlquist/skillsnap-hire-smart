
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  JobCreatorState, 
  JobCreatorActions,
  JobFormData 
} from "./types";
import { 
  generateJobPost, 
  generateSkillsTest, 
  saveJob, 
  getInitialFormData 
} from "./utils";

export const useJobCreatorLogic = (onJobCreated?: () => void, onOpenChange?: (open: boolean) => void) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [state, setState] = useState<JobCreatorState>({
    currentStep: 1,
    isGenerating: false,
    isSaving: false,
    formData: getInitialFormData(),
    generatedJobPost: "",
    generatedSkillsTest: "",
    isEditingJobPost: false,
    isEditingSkillsTest: false,
  });

  const actions: JobCreatorActions = {
    setCurrentStep: (step: number) => setState(prev => ({ ...prev, currentStep: step })),
    setIsGenerating: (loading: boolean) => setState(prev => ({ ...prev, isGenerating: loading })),
    setIsSaving: (saving: boolean) => setState(prev => ({ ...prev, isSaving: saving })),
    updateFormData: (field: keyof JobFormData, value: string) => 
      setState(prev => ({ ...prev, formData: { ...prev.formData, [field]: value } })),
    setGeneratedJobPost: (content: string) => 
      setState(prev => ({ ...prev, generatedJobPost: content })),
    setGeneratedSkillsTest: (content: string) => 
      setState(prev => ({ ...prev, generatedSkillsTest: content })),
    setIsEditingJobPost: (editing: boolean) => 
      setState(prev => ({ ...prev, isEditingJobPost: editing })),
    setIsEditingSkillsTest: (editing: boolean) => 
      setState(prev => ({ ...prev, isEditingSkillsTest: editing })),
  };

  const handleGenerateJobPost = async () => {
    if (!state.formData.title || !state.formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the job title and description first.",
        variant: "destructive"
      });
      return;
    }

    actions.setIsGenerating(true);
    try {
      const data = await generateJobPost(state.formData, null, null);
      actions.setGeneratedJobPost(data.jobPost);
    } catch (error) {
      console.error('Error generating job post:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate job post. Please try again.",
        variant: "destructive"
      });
    } finally {
      actions.setIsGenerating(false);
    }
  };

  const handleGenerateSkillsTest = async () => {
    if (!state.generatedJobPost) {
      toast({
        title: "Generate Job Post First",
        description: "Please generate the job post before creating the skills test.",
        variant: "destructive"
      });
      return;
    }

    actions.setIsGenerating(true);
    try {
      const data = await generateSkillsTest(state.generatedJobPost);
      actions.setGeneratedSkillsTest(data.test);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate skills test. Please try again.",
        variant: "destructive"
      });
    } finally {
      actions.setIsGenerating(false);
    }
  };

  const handleSaveJob = async (status: 'draft' | 'active') => {
    if (!user?.id) return;

    actions.setIsSaving(true);
    try {
      await saveJob(
        user.id,
        state.formData,
        state.generatedJobPost,
        state.generatedSkillsTest,
        status
      );

      toast({
        title: status === 'active' ? "Job Published!" : "Job Saved!",
        description: status === 'active' 
          ? "Your job posting is now live and accepting applications."
          : "Your job has been saved as a draft."
      });

      onJobCreated?.();
      onOpenChange?.(false);
      
      // Reset state
      setState({
        currentStep: 1,
        isGenerating: false,
        isSaving: false,
        formData: getInitialFormData(),
        generatedJobPost: "",
        generatedSkillsTest: "",
        isEditingJobPost: false,
        isEditingSkillsTest: false,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save job. Please try again.",
        variant: "destructive"
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
    handleSaveJob
  };
};
