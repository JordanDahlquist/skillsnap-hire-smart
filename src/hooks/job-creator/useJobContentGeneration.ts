
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SkillsTestData } from "@/types/skillsAssessment";
import { UnifiedJobFormData, CompanyAnalysisData } from "@/types/jobForm";

export const useJobContentGeneration = () => {
  const { toast } = useToast();

  const generateJobPost = async (
    formData: any, 
    setIsGenerating: (loading: boolean) => void, 
    setGeneratedJobPost: (content: string) => void,
    websiteAnalysisData?: any
  ) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: formData,
          websiteAnalysisData: websiteAnalysisData
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
    formData: UnifiedJobFormData,
    generatedJobPost: string, 
    setIsGenerating: (loading: boolean) => void, 
    setSkillsTestData: (data: SkillsTestData) => void,
    websiteAnalysisData?: CompanyAnalysisData | null
  ) => {
    setIsGenerating(true);
    try {
      console.log('Generating skills questions with full context:', {
        formData,
        generatedJobPost: generatedJobPost.substring(0, 200) + '...',
        websiteAnalysisData
      });
      
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'skills-test',
          formData: formData,
          existingJobPost: generatedJobPost,
          websiteAnalysisData: websiteAnalysisData
        }
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw response.error;
      }
      
      console.log('Enhanced skills assessment response:', response.data);
      
      // Handle the enhanced response structure
      let skillsTestData: SkillsTestData;
      
      if (response.data.skillsTest && response.data.skillsTest.questions) {
        // New structured response with question types and metadata
        skillsTestData = {
          questions: response.data.skillsTest.questions.map((q: any, index: number) => ({
            id: crypto.randomUUID(),
            title: q.title || undefined, // Include the custom title if present
            question: q.question || q.challenge || '',
            type: q.type || 'text',
            candidateInstructions: q.candidateInstructions || q.instructions,
            evaluationGuidelines: q.evaluationGuidelines,
            scoringCriteria: q.scoringCriteria,
            exampleResponse: q.exampleResponse,
            required: q.required !== false,
            order: index + 1,
            characterLimit: q.characterLimit,
            timeLimit: q.timeLimit,
            allowedFileTypes: q.allowedFileTypes,
            maxFileSize: q.maxFileSize
          })),
          maxQuestions: response.data.skillsTest.maxQuestions || 5,
          mode: 'ai_generated',
          estimatedCompletionTime: response.data.skillsTest.estimatedCompletionTime || 30,
          instructions: response.data.skillsTest.instructions || 'Complete the following skills assessment challenges to demonstrate your qualifications for this role.'
        };
      } else if (response.data.questions && Array.isArray(response.data.questions)) {
        // Fallback for simple questions array
        skillsTestData = {
          questions: response.data.questions.map((q: any, index: number) => ({
            id: crypto.randomUUID(),
            question: typeof q === 'string' ? q : q.question || q.text || '',
            type: 'text' as const,
            required: true,
            order: index + 1
          })),
          maxQuestions: 10,
          mode: 'ai_generated'
        };
      } else {
        throw new Error('Invalid response format from enhanced skills test generation');
      }
      
      setSkillsTestData(skillsTestData);
      toast({
        title: "Skills assessment generated!",
        description: `${skillsTestData.questions.length} creative skills challenges have been generated successfully.`,
      });
    } catch (error) {
      console.error('Error generating skills questions:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate skills assessment. Please try again.",
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
