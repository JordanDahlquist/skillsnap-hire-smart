
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UnifiedJobFormData } from '@/types/jobForm';

export const useJobContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateJobPost = async (
    formData: UnifiedJobFormData,
    setIsGeneratingCallback: (loading: boolean) => void,
    setGeneratedJobPostCallback: (content: string) => void,
    websiteAnalysisData?: any,
    writingTone?: string
  ) => {
    setIsGeneratingCallback(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-post', {
        body: {
          formData,
          websiteAnalysisData,
          writingTone
        }
      });

      if (error) throw error;

      if (data?.jobPost) {
        setGeneratedJobPostCallback(data.jobPost);
        toast.success('Job post generated successfully!');
      } else {
        throw new Error('No job post content received');
      }
    } catch (error) {
      console.error('Error generating job post:', error);
      toast.error('Failed to generate job post. Please try again.');
    } finally {
      setIsGeneratingCallback(false);
    }
  };

  const generateSkillsQuestions = async (
    formData: UnifiedJobFormData,
    generatedJobPost: string,
    setIsGeneratingCallback: (loading: boolean) => void,
    setSkillsTestDataCallback: (data: any) => void,
    websiteAnalysisData?: any
  ) => {
    setIsGeneratingCallback(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-skills-questions', {
        body: {
          formData,
          generatedJobPost,
          websiteAnalysisData
        }
      });

      if (error) throw error;

      if (data?.questions) {
        setSkillsTestDataCallback(data.questions);
        toast.success('Skills assessment generated successfully!');
      } else {
        throw new Error('No skills questions received');
      }
    } catch (error) {
      console.error('Error generating skills questions:', error);
      toast.error('Failed to generate skills assessment. Please try again.');
    } finally {
      setIsGeneratingCallback(false);
    }
  };

  const generateInterviewQuestions = async (
    formData: UnifiedJobFormData,
    generatedJobPost: string,
    skillsTestData: any,
    setIsGeneratingCallback: (loading: boolean) => void,
    setInterviewQuestionsDataCallback: (data: any) => void,
    setInterviewQuestionsViewStateCallback: (state: any) => void,
    setGeneratedInterviewQuestionsCallback?: (questions: string) => void
  ) => {
    setIsGeneratingCallback(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: {
          formData,
          generatedJobPost,
          skillsTestData
        }
      });

      if (error) throw error;

      if (data?.questions) {
        // Set the structured data for the editor
        setInterviewQuestionsDataCallback(data.questions);
        setInterviewQuestionsViewStateCallback({ isEditing: false, showJson: false });
        
        // IMPORTANT: Also set the raw generated text for database storage
        if (setGeneratedInterviewQuestionsCallback && data.rawQuestions) {
          setGeneratedInterviewQuestionsCallback(data.rawQuestions);
        } else if (setGeneratedInterviewQuestionsCallback) {
          // Fallback: convert structured questions to raw text format
          const rawQuestions = data.questions.questions
            .map((q: any, index: number) => `${index + 1}. ${q.question}`)
            .join('\n\n');
          setGeneratedInterviewQuestionsCallback(rawQuestions);
        }
        
        toast.success('Interview questions generated successfully!');
      } else {
        throw new Error('No interview questions received');
      }
    } catch (error) {
      console.error('Error generating interview questions:', error);
      toast.error('Failed to generate interview questions. Please try again.');
    } finally {
      setIsGeneratingCallback(false);
    }
  };

  return {
    generateJobPost,
    generateSkillsQuestions,
    generateInterviewQuestions,
    isGenerating
  };
};
