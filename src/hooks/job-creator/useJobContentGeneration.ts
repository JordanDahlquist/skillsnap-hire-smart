
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UnifiedJobFormData } from '@/types/jobForm';
import { parseInterviewQuestionsFromMarkdown } from '@/utils/interviewQuestionParser';

export const useJobContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateJobPost = async (
    formData: UnifiedJobFormData,
    setIsGeneratingCallback: (loading: boolean) => void,
    setGeneratedJobPostCallback: (content: string) => void,
    websiteAnalysisData?: any,
    writingTone?: string
  ) => {
    console.log('Starting job post generation with:', { formData, websiteAnalysisData, writingTone });
    setIsGeneratingCallback(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: formData,
          websiteAnalysisData,
          writingTone
        }
      });

      console.log('Job post generation response:', { data, error });

      if (error) {
        console.error('Job post generation error:', error);
        throw error;
      }

      // The edge function returns { jobPost: content } for job-post type
      if (data?.jobPost) {
        setGeneratedJobPostCallback(data.jobPost);
        toast.success('Job post generated successfully!');
      } else {
        console.error('No job post content received:', data);
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
    console.log('Starting skills questions generation');
    setIsGeneratingCallback(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'skills-test',
          jobData: formData,
          generatedJobPost,
          websiteAnalysisData
        }
      });

      console.log('Skills questions generation response:', { data, error });

      if (error) {
        console.error('Skills questions generation error:', error);
        throw error;
      }

      // The edge function returns { skillsTest: content } for skills-test type
      if (data?.skillsTest) {
        setSkillsTestDataCallback(data.skillsTest);
        toast.success('Skills assessment generated successfully!');
      } else {
        console.error('No skills questions received:', data);
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
    console.log('Starting interview questions generation');
    setIsGeneratingCallback(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'interview-questions',
          jobData: formData,
          generatedJobPost,
          skillsTestData
        }
      });

      console.log('Interview questions generation response:', { data, error });

      if (error) {
        console.error('Interview questions generation error:', error);
        throw error;
      }

      // The edge function returns { questions: content } for interview-questions type
      if (data?.questions) {
        console.log('Raw questions received:', data.questions);
        
        // Parse the raw markdown into structured data
        const parsedInterviewData = parseInterviewQuestionsFromMarkdown(data.questions);
        console.log('Parsed interview data:', parsedInterviewData);
        
        // Set the structured data for the editor
        setInterviewQuestionsDataCallback(parsedInterviewData);
        setInterviewQuestionsViewStateCallback('editor'); // Go directly to editor view
        
        // IMPORTANT: Also set the raw generated text for database storage
        if (setGeneratedInterviewQuestionsCallback) {
          if (data.rawQuestions) {
            setGeneratedInterviewQuestionsCallback(data.rawQuestions);
          } else {
            // Use the original questions text as fallback
            setGeneratedInterviewQuestionsCallback(data.questions);
          }
        }
        
        toast.success('Interview questions generated successfully!');
      } else {
        console.error('No interview questions received:', data);
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
