
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggerService";

export const useAIGeneration = (
  setGeneratedJobPost: (content: string) => void,
  setGeneratedSkillsTest: (content: string) => void
) => {
  const generateJobPost = async (
    formData: any,
    uploadedPdfContent: string | null,
    rewriteWithAI: boolean
  ) => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the job title and description first.",
        variant: "destructive"
      });
      return;
    }

    let descriptionToUse = formData.description;
    
    if (uploadedPdfContent && rewriteWithAI) {
      descriptionToUse = uploadedPdfContent;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: {
            title: formData.title,
            employmentType: formData.employment_type,
            experience: formData.experience_level,
            duration: formData.duration,
            budget: formData.budget,
            skills: formData.required_skills,
            description: descriptionToUse
          }
        }
      });

      if (error) throw error;
      
      setGeneratedJobPost(data.jobPost);
      toast({
        title: "Job Post Generated!",
        description: "Your AI-powered job posting is ready for review."
      });
    } catch (error) {
      logger.error('Error generating job post:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate job post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateSkillsTest = async (generatedJobPost: string) => {
    if (!generatedJobPost) {
      toast({
        title: "Generate Job Post First",
        description: "Please generate the job post before creating the skills test.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'skills-test',
          existingJobPost: generatedJobPost
        }
      });

      if (error) throw error;
      
      setGeneratedSkillsTest(data.test);
      toast({
        title: "Skills Test Generated!",
        description: "Your AI-powered skills assessment is ready for review."
      });
    } catch (error) {
      logger.error('Error generating skills test:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate skills test. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    generateJobPost,
    generateSkillsTest
  };
};
