
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SkillsTestData } from "@/types/skillsAssessment";
import { UnifiedJobFormData, CompanyAnalysisData, WritingTone } from "@/types/jobForm";
import { InterviewQuestionsData, InterviewQuestion } from "@/types/interviewQuestions";

export const useJobContentGeneration = () => {
  const { toast } = useToast();

  const generateJobPost = async (
    formData: any, 
    setIsGenerating: (loading: boolean) => void, 
    setGeneratedJobPost: (content: string) => void,
    websiteAnalysisData?: any,
    writingTone?: WritingTone
  ) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-job-content', {
        body: {
          type: 'job-post',
          jobData: formData,
          websiteAnalysisData: websiteAnalysisData,
          writingTone: writingTone
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
    setInterviewQuestionsData: (data: InterviewQuestionsData) => void,
    setInterviewQuestionsViewState: (viewState: 'initial' | 'editor' | 'preview') => void
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
      
      // Parse the AI-generated text into structured InterviewQuestion objects
      const generatedText = response.data.questions;
      console.log('Raw AI response for interview questions:', generatedText);
      
      const parsedQuestions = parseInterviewQuestionsFromText(generatedText);
      console.log('Parsed interview questions:', parsedQuestions);
      
      // Set the structured data directly into the questions builder
      const interviewQuestionsData: InterviewQuestionsData = {
        questions: parsedQuestions,
        mode: 'ai_generated',
        estimatedCompletionTime: parsedQuestions.length * 5, // Estimate 5 minutes per question
        instructions: 'Please answer the following interview questions to help us better understand your qualifications and fit for this role.'
      };
      
      setInterviewQuestionsData(interviewQuestionsData);
      
      // Switch to editor view to show the pre-filled questions builder
      setInterviewQuestionsViewState('editor');
      
      toast({
        title: "Interview questions generated!",
        description: `${parsedQuestions.length} interview questions have been generated and added to your questions builder.`,
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

// Helper function to parse AI-generated text into structured InterviewQuestion objects
const parseInterviewQuestionsFromText = (text: string): InterviewQuestion[] => {
  const questions: InterviewQuestion[] = [];
  
  console.log('Parsing interview questions from text:', text.substring(0, 200) + '...');
  
  // Clean the text first - remove excessive whitespace and normalize line breaks
  const cleanedText = text.trim().replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n\n');
  
  // Try multiple parsing strategies to handle different AI response formats
  
  // Strategy 1: Split by numbered questions with various formats
  let questionBlocks = cleanedText.split(/(?:\n|^)(?:\*{0,2}(?:Question\s*)?(?:\d+)[.:)\s*]|\d+\.\s|\*\s|\•\s)/i);
  
  // If that didn't work well, try splitting by double line breaks
  if (questionBlocks.length <= 2) {
    questionBlocks = cleanedText.split(/\n\n+/);
  }
  
  // If still no good results, try splitting by single line breaks with question indicators
  if (questionBlocks.length <= 2) {
    questionBlocks = cleanedText.split(/\n(?=.*(?:question|ask|tell|describe|explain|how|what|why|when|where))/i);
  }
  
  console.log('Found question blocks:', questionBlocks.length, questionBlocks.map(b => b.substring(0, 50) + '...'));
  
  questionBlocks.forEach((block, index) => {
    const cleanBlock = block.trim();
    if (!cleanBlock) return;
    
    // Extract title and question content
    const lines = cleanBlock.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;
    
    let title = '';
    let questionText = '';
    let candidateInstructions = '';
    
    // Look for formatted titles (with asterisks or colons)
    const firstLine = lines[0].trim();
    const titleMatch = firstLine.match(/^\*{0,2}(?:Question\s*\d+[.:]\s*)?(.+?)[:*]*$/i);
    
    if (titleMatch && lines.length > 1) {
      // Extract title and use remaining lines as question
      title = titleMatch[1].replace(/[*:]/g, '').trim();
      questionText = lines.slice(1).join(' ').trim();
    } else {
      // No clear title, use the first substantial line as question
      questionText = firstLine;
      
      // If there are additional lines, they might be instructions
      if (lines.length > 1) {
        const restOfContent = lines.slice(1).join(' ').trim();
        if (restOfContent.toLowerCase().includes('please') || 
            restOfContent.toLowerCase().includes('consider') ||
            restOfContent.toLowerCase().includes('include') ||
            restOfContent.toLowerCase().includes('explain') ||
            restOfContent.length > 20) {
          candidateInstructions = restOfContent;
        }
      }
    }
    
    // Clean up the question text
    questionText = questionText
      .replace(/^\*+|\*+$/g, '') // Remove leading/trailing asterisks
      .replace(/^[:\-\s]+|[:\-\s]+$/g, '') // Remove leading/trailing colons, dashes, spaces
      .trim();
    
    // Validate that we have a real question
    if (questionText.length < 10) {
      console.log('Skipping short text:', questionText);
      return;
    }
    
    // Ensure it looks like a question (has question words or ends with question mark)
    const hasQuestionWords = /\b(what|how|why|when|where|tell|describe|explain|discuss|share)\b/i.test(questionText);
    const endsWithQuestionMark = questionText.endsWith('?');
    
    if (!hasQuestionWords && !endsWithQuestionMark && questionText.length < 30) {
      console.log('Skipping non-question text:', questionText);
      return;
    }
    
    // Determine question type based on content
    let questionType: InterviewQuestion['type'] = 'video_response';
    let videoMaxLength = 5;
    
    if (questionText.toLowerCase().includes('technical') || 
        questionText.toLowerCase().includes('code') ||
        questionText.toLowerCase().includes('implement') ||
        questionText.toLowerCase().includes('algorithm')) {
      questionType = 'technical';
    } else if (questionText.toLowerCase().includes('behavior') ||
               questionText.toLowerCase().includes('situation') ||
               questionText.toLowerCase().includes('experience') ||
               questionText.toLowerCase().includes('challenge') ||
               questionText.toLowerCase().includes('conflict')) {
      questionType = 'behavioral';
    } else if (questionText.toLowerCase().includes('write') ||
               questionText.toLowerCase().includes('describe in detail') ||
               questionText.toLowerCase().includes('explain your approach')) {
      questionType = 'text_response';
    }
    
    // Adjust video length based on question complexity
    if (questionText.length > 200 || questionText.toLowerCase().includes('detailed')) {
      videoMaxLength = 10;
    } else if (questionText.length < 100) {
      videoMaxLength = 3;
    }
    
    const newQuestion: InterviewQuestion = {
      id: crypto.randomUUID(),
      question: questionText,
      type: questionType,
      required: index < 3, // Make first 3 questions required
      order: index + 1,
      videoMaxLength: questionType === 'video_response' ? videoMaxLength : undefined,
      candidateInstructions: candidateInstructions || undefined
    };
    
    console.log('Created question:', newQuestion);
    questions.push(newQuestion);
  });
  
  // If we couldn't parse any questions, create a fallback
  if (questions.length === 0) {
    console.log('No questions parsed, creating fallback');
    const fallbackQuestion = cleanedText.length > 20 ? cleanedText : 'Tell us about your interest in this position and relevant experience.';
    
    questions.push({
      id: crypto.randomUUID(),
      question: fallbackQuestion,
      type: 'video_response',
      required: true,
      order: 1,
      videoMaxLength: 5
    });
  }
  
  console.log('Final parsed questions:', questions);
  return questions;
};
