
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SkillsTestData } from "@/types/skillsAssessment";

export const useJobContentGeneration = () => {
  const { toast } = useToast();

  const generateJobPost = async (formData: any, setIsGenerating: (loading: boolean) => void, setGeneratedJobPost: (content: string) => void) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: formData
        }
      });

      if (response.error) throw response.error;
      
      setGeneratedJobPost(response.data.jobPost);
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
      setIsGenerating(false);
    }
  };

  const generateSkillsQuestions = async (
    generatedJobPost: string, 
    setIsGenerating: (loading: boolean) => void, 
    setSkillsTestData: (data: SkillsTestData) => void
  ) => {
    setIsGenerating(true);
    try {
      console.log('Generating skills questions with job post:', generatedJobPost);
      
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'skills-test',
          existingJobPost: generatedJobPost
        }
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw response.error;
      }
      
      console.log('Skills questions response:', response.data);
      
      // Handle the response based on its structure
      let skillsTestData: SkillsTestData;
      
      if (response.data.questions && Array.isArray(response.data.questions)) {
        // If we get a structured response with questions array
        skillsTestData = {
          questions: response.data.questions.map((q: any, index: number) => ({
            id: crypto.randomUUID(),
            question: typeof q === 'string' ? q : q.question || q.text || '',
            type: 'text' as const,
            required: true,
            order: index + 1
          })),
          maxQuestions: 10
        };
      } else if (response.data.test && typeof response.data.test === 'string') {
        // If we get a raw test string, try to parse it
        const testContent = response.data.test;
        const lines = testContent.split('\n').filter(line => line.trim().length > 0);
        const questions = lines
          .filter(line => line.match(/^\d+\.|^Q\d+:|Question \d+/i))
          .map((line, index) => line.replace(/^\d+\.\s*|^Q\d+:\s*|Question \d+:\s*/i, '').trim())
          .filter(q => q.length > 0);
        
        skillsTestData = {
          questions: questions.map((question, index) => ({
            id: crypto.randomUUID(),
            question,
            type: 'text' as const,
            required: true,
            order: index + 1
          })),
          maxQuestions: 10
        };
      } else {
        throw new Error('Invalid response format from skills test generation');
      }
      
      setSkillsTestData(skillsTestData);
      toast({
        title: "Questions generated!",
        description: `${skillsTestData.questions.length} skills assessment questions have been generated successfully.`,
      });
    } catch (error) {
      console.error('Error generating skills questions:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate skills questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInterviewQuestions = async (
    formData: any,
    generatedJobPost: string,
    skillsTestData: SkillsTestData,
    setIsGenerating: (loading: boolean) => void,
    setGeneratedInterviewQuestions: (content: string) => void
  ) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'interview-questions',
          jobData: formData,
          existingJobPost: generatedJobPost,
          existingSkillsTest: skillsTestData.questions.length > 0 ? JSON.stringify(skillsTestData) : ""
        }
      });

      if (response.error) throw response.error;
      
      setGeneratedInterviewQuestions(response.data.questions);
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
      setIsGenerating(false);
    }
  };

  return {
    generateJobPost,
    generateSkillsQuestions,
    generateInterviewQuestions
  };
};
